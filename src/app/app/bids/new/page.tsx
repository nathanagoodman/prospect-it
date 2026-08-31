"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TRADE_CONFIGS,
  getTradeConfig,
  getTradeSpecificMetrics,
  ALL_METRICS,
  type TradeType,
} from "@/lib/trades";
import { estimateFromMetrics, hasCostBasis } from "@/lib/estimator";
import {
  assembliesForTrade,
  hasAssemblies,
  totalAssemblies,
  type AssemblyLine,
} from "@/lib/assemblies";

interface LineItem {
  id: string;
  category: string;
  description: string;
  qty: number;
  unitPrice: number;
}

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface TradeMetrics {
  [key: string]: number;
}

interface UserData {
  tier: "GC" | "TRADE";
  tradeType?: string;
  enabledTrades: string[];
  name?: string;
}

// For GC mode: each selected trade has its own bid amount and optional notes
interface SubBidEntry {
  tradeType: TradeType;
  bidAmount: number;
  notes: string;
}

const TRADE_ICONS: { [key: string]: string } = {
  electrical: "⚡",
  plumbing: "🔧",
  hvac: "❄️",
  roofing: "🏠",
  framing: "🪵",
  drywall: "🪟",
  painting: "🎨",
  flooring: "🪵",
  masonry: "🧱",
  concrete: "🧱",
  landscaping: "🌿",
  welding: "🔥",
  demolition: "💥",
  excavation: "⛏️",
  insulation: "🧤",
  general: "🏗️",
};

export default function NewBidPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // TRADE mode: traditional line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", category: "", description: "", qty: 1, unitPrice: 0 },
  ]);

  // GC mode: selected trades and their sub bids
  const [selectedTrades, setSelectedTrades] = useState<TradeType[]>([]);
  const [subBids, setSubBids] = useState<Record<string, SubBidEntry>>({});

  // Form data
  const [formData, setFormData] = useState({
    jobName: "",
    description: "",
    tradeType: "",
    clientId: "",
    materialCost: 0,
    laborHours: 0,
    laborRate: 0,
    equipmentCost: 0,
    subcontractorCost: 0,
    permitCost: 0,
    overheadPercent: 10,
    profitPercent: 15,
    contingencyPercent: 5,
    dueDate: "",
    // GC-specific fields
    gcManagementPercent: 10,
    gcInsuranceCost: 0,
    gcPermitCost: 0,
  });

  const [tradeMetrics, setTradeMetrics] = useState<TradeMetrics>({});

  // Labor burden helper.
  //
  // The single most common way a contractor under-bids: typing their base
  // wage into the labor rate. A tradesperson paid $45/hr actually costs
  // the business $63-72 once payroll taxes, workers' comp, liability, and
  // benefits are counted. Bidding at base wage silently gives away that
  // difference on every hour of every job.
  const [showBurden, setShowBurden] = useState(false);
  const [baseWage, setBaseWage] = useState(0);
  const [burdenPercent, setBurdenPercent] = useState(45);

  const loadedRate =
    baseWage > 0 ? Math.round(baseWage * (1 + burdenPercent / 100) * 100) / 100 : 0;

  // Inline client creation. Without this, discovering mid-bid that the
  // customer isn't saved yet means abandoning the bid, going to Clients,
  // and starting over — painful on desktop, a dealbreaker on a phone at
  // a job site.
  const [showNewClient, setShowNewClient] = useState(false);
  const [savingClient, setSavingClient] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
  });

  const createClient = async () => {
    if (!newClient.name.trim()) {
      setClientError("A name is required.");
      return;
    }
    setSavingClient(true);
    setClientError(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClient.name.trim(),
          company: newClient.company.trim() || undefined,
          email: newClient.email.trim() || undefined,
          phone: newClient.phone.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not save that client.");
      }
      const created = await res.json();
      // Add to the list and select it immediately — the whole point is
      // not losing your place in the bid.
      setClients((prev) => [created, ...prev]);
      setFormData((prev) => ({ ...prev, clientId: created.id }));
      setNewClient({ name: "", company: "", email: "", phone: "" });
      setShowNewClient(false);
    } catch (e) {
      setClientError(e instanceof Error ? e.message : "Could not save that client.");
    } finally {
      setSavingClient(false);
    }
  };

  // Calculated values
  const [calculations, setCalculations] = useState({
    laborCost: 0,
    subtotal: 0,
    overhead: 0,
    profit: 0,
    contingency: 0,
    totalBid: 0,
    profitMargin: 0,
    // GC-specific
    subTotal: 0,
    managementFee: 0,
  });

  const isGCAccount = user?.tier === "GC";

  // A GC account can bid two ways:
  //   "project" — multiple trades, each with a sub bid (the default)
  //   "trade"   — a single scope they're self-performing, using the same
  //               trade-specific estimator a trade account gets
  // Previously a GC was locked into "project", so a GC who pours their own
  // concrete had no way to estimate it properly.
  const [bidMode, setBidMode] = useState<"project" | "trade">("project");

  // Everything downstream keys off this: a GC in trade mode behaves
  // exactly like a trade account.
  const isGC = isGCAccount && bidMode === "project";

  // Assembly-based takeoff. Contractors count what they can see —
  // receptacles, fixtures, registers — and each assembly carries the
  // material and labor that go with it. This sits alongside the older
  // aggregate metrics rather than replacing them.
  const [assemblyQty, setAssemblyQty] = useState<Record<string, number>>({});

  const tradeAssemblies = useMemo(
    () => (formData.tradeType ? assembliesForTrade(formData.tradeType) : []),
    [formData.tradeType]
  );

  const assemblyTotals = useMemo(() => {
    const selections: AssemblyLine[] = Object.entries(assemblyQty)
      .filter(([, q]) => (Number(q) || 0) > 0)
      .map(([assemblyId, quantity]) => ({ assemblyId, quantity: Number(quantity) }));
    return selections.length ? totalAssemblies(selections) : null;
  }, [assemblyQty]);

  const applyAssemblies = () => {
    if (!assemblyTotals) return;
    setFormData((prev) => ({
      ...prev,
      materialCost: assemblyTotals.materialCost,
      laborHours: assemblyTotals.laborHours,
    }));
  };

  // Suggested material/labor derived from the trade takeoff quantities.
  // This is a suggestion only — it is never written into formData unless
  // the user explicitly applies it.
  const estimate = useMemo(() => {
    if (isGC || !formData.tradeType) return null;
    const labels: Record<string, { label: string; unit: string }> = {};
    for (const m of getTradeSpecificMetrics(formData.tradeType)) {
      labels[m.key] = { label: m.label, unit: m.unit };
    }
    const result = estimateFromMetrics(formData.tradeType, tradeMetrics, labels);
    return result.available ? result : null;
  }, [isGC, formData.tradeType, tradeMetrics]);

  const applyEstimate = () => {
    if (!estimate) return;
    setFormData((prev) => ({
      ...prev,
      materialCost: estimate.materialCost,
      laborHours: estimate.laborHours,
    }));
  };

  useEffect(() => {
    fetchUserData();
    fetchClients();
  }, []);

  useEffect(() => {
    recalculateTotals();
    // bidMode belongs here: switching between project and single-trade
    // changes which branch computes the total. Without it the sidebar
    // would show a stale number until some other field changed.
  }, [formData, lineItems, subBids, selectedTrades, user, bidMode]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = (await res.json()) as Client[];
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const recalculateTotals = () => {
    if (isGC) {
      // GC mode: sum of all sub bids + GC costs
      const subTotal = selectedTrades.reduce((sum, trade) => {
        return sum + (subBids[trade]?.bidAmount || 0);
      }, 0);

      const gcCosts = formData.gcInsuranceCost + formData.gcPermitCost;
      const subtotal = subTotal + gcCosts;
      const managementFee = subtotal * (formData.gcManagementPercent / 100);
      const overhead = subtotal * (formData.overheadPercent / 100);
      const profit = subtotal * (formData.profitPercent / 100);
      const contingency = subtotal * (formData.contingencyPercent / 100);
      const totalBid = subtotal + managementFee + overhead + profit + contingency;
      const profitMargin = totalBid > 0 ? ((profit + managementFee) / totalBid) * 100 : 0;

      setCalculations({
        laborCost: 0,
        subtotal,
        overhead,
        profit,
        contingency,
        totalBid,
        profitMargin,
        subTotal,
        managementFee,
      });
    } else {
      // TRADE mode: cost buckets plus any itemized lines.
      const laborCost = formData.laborHours * formData.laborRate;

      // Line items are part of the bid, not decoration. Without this a
      // user could itemize the whole job and still see a $0 total.
      const lineItemsTotal = lineItems.reduce(
        (sum, li) => sum + (li.qty || 0) * (li.unitPrice || 0),
        0
      );

      const subtotal =
        formData.materialCost +
        laborCost +
        formData.equipmentCost +
        formData.subcontractorCost +
        formData.permitCost +
        lineItemsTotal;

      const overhead = subtotal * (formData.overheadPercent / 100);
      const profit = subtotal * (formData.profitPercent / 100);
      const contingency = subtotal * (formData.contingencyPercent / 100);
      const totalBid = subtotal + overhead + profit + contingency;
      const profitMargin = totalBid > 0 ? (profit / totalBid) * 100 : 0;

      setCalculations({
        laborCost,
        subtotal,
        overhead,
        profit,
        contingency,
        totalBid,
        profitMargin,
        subTotal: 0,
        managementFee: 0,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numFields = [
      "materialCost", "laborHours", "laborRate", "equipmentCost",
      "subcontractorCost", "permitCost", "overheadPercent", "profitPercent",
      "contingencyPercent", "gcManagementPercent", "gcInsuranceCost", "gcPermitCost",
    ];
    const numValue = numFields.includes(name) ? parseFloat(value) || 0 : value;

    // When trade type changes (TRADE mode), auto-set defaults
    if (name === "tradeType") {
      const tradeConfig = getTradeConfig(value as string);
      setFormData((prev) => ({
        ...prev,
        tradeType: value,
        overheadPercent: tradeConfig.defaultOverhead,
        profitPercent: tradeConfig.defaultProfit,
        contingencyPercent: tradeConfig.defaultContingency,
      }));
      setTradeMetrics({});
      setAssemblyQty({});
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    }
  };

  const handleTradeMetricChange = (key: string, value: number) => {
    setTradeMetrics((prev) => ({
      ...prev,
      [key]: value || 0,
    }));
  };

  // ─── GC Trade Selection ────────────────────────────────────
  const toggleTrade = (tradeId: TradeType) => {
    setSelectedTrades((prev) => {
      if (prev.includes(tradeId)) {
        // Remove trade
        const updated = prev.filter((t) => t !== tradeId);
        // Also remove the sub bid entry
        setSubBids((prevBids) => {
          const newBids = { ...prevBids };
          delete newBids[tradeId];
          return newBids;
        });
        return updated;
      } else {
        // Add trade
        setSubBids((prevBids) => ({
          ...prevBids,
          [tradeId]: { tradeType: tradeId, bidAmount: 0, notes: "" },
        }));
        return [...prev, tradeId];
      }
    });
  };

  const updateSubBid = (tradeId: string, field: keyof SubBidEntry, value: any) => {
    setSubBids((prev) => ({
      ...prev,
      [tradeId]: {
        ...prev[tradeId],
        [field]: field === "bidAmount" ? (parseFloat(value) || 0) : value,
      },
    }));
  };

  const selectAllTrades = () => {
    const allTrades = Object.keys(TRADE_CONFIGS).filter((t) => t !== "general") as TradeType[];
    setSelectedTrades(allTrades);
    const newBids: Record<string, SubBidEntry> = {};
    allTrades.forEach((t) => {
      newBids[t] = subBids[t] || { tradeType: t, bidAmount: 0, notes: "" };
    });
    setSubBids(newBids);
  };

  const clearAllTrades = () => {
    setSelectedTrades([]);
    setSubBids({});
  };

  // ─── TRADE Line Items ─────────────────────────────────────
  const addLineItem = () => {
    const newId = (Math.max(...lineItems.map((li) => parseInt(li.id) || 0)) + 1).toString();
    setLineItems([...lineItems, { id: newId, category: "", description: "", qty: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((li) => li.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map((li) =>
        li.id === id ? { ...li, [field]: value } : li
      )
    );
  };

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bidData = isGC
        ? {
            ...formData,
            ...calculations,
            tradeType: "general",
            selectedTrades,
            subBids: Object.values(subBids),
            lineItems: selectedTrades.map((trade) => ({
              id: trade,
              category: TRADE_CONFIGS[trade].label,
              description: subBids[trade]?.notes || `${TRADE_CONFIGS[trade].label} scope`,
              qty: 1,
              unitPrice: subBids[trade]?.bidAmount || 0,
            })),
            tradeMetrics,
          }
        : {
            ...formData,
            ...calculations,
            lineItems,
            tradeMetrics: {
              ...tradeMetrics,
              // Stored alongside the aggregate metrics so a saved bid can
              // be reopened with the takeoff intact.
              _assemblies: assemblyQty,
            },
          };

      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bidData),
      });

      if (res.ok) {
        router.push("/app/bids");
      } else {
        const error = await res.json();
        alert("Error creating bid: " + error.error);
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      alert("Failed to create bid");
    } finally {
      setSubmitting(false);
    }
  };

  // Available trades for the GC grid (exclude "general")
  const availableTrades = Object.values(TRADE_CONFIGS).filter((t) => t.id !== "general");

  if (userLoading) {
    return (
      <div className="p-4 pb-40 lg:pb-8 sm:p-8 bg-slate-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Link href="/app/bids" className="text-orange-600 hover:text-orange-700">
            Bids
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">New Bid</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Create New Bid
          </h1>
          {isGC && (
            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              GC Mode
            </span>
          )}
        </div>

        {isGCAccount && (
          <div className="mt-4 inline-flex rounded-xl bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => setBidMode("project")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                bidMode === "project"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Multi-trade project
            </button>
            <button
              type="button"
              onClick={() => setBidMode("trade")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                bidMode === "trade"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Single trade
            </button>
          </div>
        )}

        <p className="text-slate-500 mt-3">
          {isGC
            ? "Select the trades involved and enter sub bids for each scope"
            : isGCAccount
              ? "Estimating one scope yourself — pick the trade and its takeoff quantities"
              : "Fill in the details below to create a new bid"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Info Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Job Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Name *</label>
                <input
                  type="text"
                  name="jobName"
                  value={formData.jobName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Kitchen Remodel - Main Street"
                  className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Add project details..."
                  className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!isGC && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Trade Type *</label>
                    <select
                      name="tradeType"
                      value={formData.tradeType}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                    >
                      <option value="">Select trade type...</option>
                      {Object.values(TRADE_CONFIGS)
                        // "General Contractor" isn't a self-performed scope,
                        // and picking it here would make the server treat the
                        // bid as a multi-trade GC project and look for sub
                        // bids that don't exist.
                        .filter((config) => config.id !== "general")
                        .map((config) => (
                          <option key={config.id} value={config.id}>
                            {config.icon} {config.label}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                <div className={isGC ? "col-span-2" : ""}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client</label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                  >
                    <option value="">Select client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company ? `(${client.company})` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewClient(true)}
                    className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    + Add a new client
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              GC MODE: Trade Selection Grid + Sub Bid Line Items
              ═══════════════════════════════════════════════════════════ */}
          {isGC && (
            <>
              {/* Trade Selection Grid */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Select Trades / Subs</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Choose all trades involved in this project
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllTrades}
                      className="px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllTrades}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableTrades.map((trade) => {
                    const isSelected = selectedTrades.includes(trade.id);
                    return (
                      <button
                        key={trade.id}
                        type="button"
                        onClick={() => toggleTrade(trade.id)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-orange-500 bg-orange-50 shadow-sm shadow-orange-100"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <span className="text-2xl">{TRADE_ICONS[trade.id] || trade.icon}</span>
                        <span className={`text-xs font-semibold text-center leading-tight ${
                          isSelected ? "text-orange-700" : "text-slate-600"
                        }`}>
                          {trade.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedTrades.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                      <span className="font-semibold text-orange-600">{selectedTrades.length}</span> trade{selectedTrades.length !== 1 ? "s" : ""} selected
                    </p>
                  </div>
                )}
              </div>

              {/* Sub Bid Line Items - One section per selected trade */}
              {selectedTrades.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">
                    Sub Bids by Trade
                  </h2>
                  <div className="space-y-4">
                    {selectedTrades.map((tradeId) => {
                      const config = TRADE_CONFIGS[tradeId];
                      const entry = subBids[tradeId];
                      return (
                        <div
                          key={tradeId}
                          className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <span className="text-xl">{TRADE_ICONS[tradeId] || config.icon}</span>
                            <span className="text-sm font-bold text-slate-900">{config.label}</span>
                          </div>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Bid Amount ($)</label>
                              <input
                                type="number"
                                inputMode="decimal"
                                value={entry?.bidAmount || ""}
                                onChange={(e) => updateSubBid(tradeId, "bidAmount", e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-2.5 px-3 text-sm font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                              <input
                                type="text"
                                value={entry?.notes || ""}
                                onChange={(e) => updateSubBid(tradeId, "notes", e.target.value)}
                                placeholder={`${config.label} scope details...`}
                                className="w-full rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-2.5 px-3 text-sm"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleTrade(tradeId)}
                            className="text-slate-400 hover:text-red-500 text-sm px-1 py-2 mt-4 transition-colors"
                            title="Remove trade"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GC Costs Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">GC Costs & Fees</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Insurance / Bonding ($)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      name="gcInsuranceCost"
                      value={formData.gcInsuranceCost}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Permits ($)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      name="gcPermitCost"
                      value={formData.gcPermitCost}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Management Fee (%)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      name="gcManagementPercent"
                      value={formData.gcManagementPercent}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TRADE MODE: Traditional Cost Breakdown + Line Items
              ═══════════════════════════════════════════════════════════ */}
          {!isGC && (
            <>
              {/* Cost Breakdown Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Cost Breakdown</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Material Cost ($)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      name="materialCost"
                      value={formData.materialCost}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Labor Hours</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        name="laborHours"
                        value={formData.laborHours}
                        onChange={handleInputChange}
                        min="0"
                        step="0.5"
                        className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Labor Rate ($/hr)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        name="laborRate"
                        value={formData.laborRate}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBurden(!showBurden)}
                        className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        {showBurden ? "Hide" : "This should be your loaded cost, not base wage →"}
                      </button>

                      {showBurden && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-xs leading-relaxed text-amber-900">
                            Your true labor cost includes payroll taxes, workers&apos;
                            comp, liability, and benefits — typically <strong>35–60%</strong>{" "}
                            on top of the wage. Bidding at base wage gives that
                            difference away on every hour.
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-amber-800">
                                Base wage $/hr
                              </label>
                              <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.5"
                                value={baseWage || ""}
                                onChange={(e) => setBaseWage(parseFloat(e.target.value) || 0)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") e.preventDefault();
                                }}
                                placeholder="45"
                                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-amber-800">
                                Burden %
                              </label>
                              <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                max="200"
                                step="1"
                                value={burdenPercent}
                                onChange={(e) => setBurdenPercent(parseFloat(e.target.value) || 0)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") e.preventDefault();
                                }}
                                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2"
                              />
                            </div>
                          </div>
                          {loadedRate > 0 && (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm text-amber-900">
                                Loaded cost:{" "}
                                <strong className="text-base">${loadedRate.toFixed(2)}/hr</strong>
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({ ...prev, laborRate: loadedRate }))
                                }
                                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
                              >
                                Use this rate
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Equipment Cost ($)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        name="equipmentCost"
                        value={formData.equipmentCost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subcontractor ($)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        name="subcontractorCost"
                        value={formData.subcontractorCost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Permit Cost ($)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        name="permitCost"
                        value={formData.permitCost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Assembly takeoff ───────────────────────────────────
                  Count what you can see. Each assembly bundles its own
                  material and labor, which is how the estimating books
                  and the good spreadsheets work. */}
              {formData.tradeType && hasAssemblies(formData.tradeType) && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Takeoff</h2>
                      <p className="mt-0.5 text-sm text-slate-500">
                        Count the work. Each line carries its own material and labor.
                      </p>
                    </div>
                    {assemblyTotals && (
                      <button
                        type="button"
                        onClick={applyAssemblies}
                        className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Use these numbers
                      </button>
                    )}
                  </div>

                  {Object.entries(
                    tradeAssemblies.reduce<Record<string, typeof tradeAssemblies>>(
                      (acc, a) => {
                        (acc[a.category] ||= []).push(a);
                        return acc;
                      },
                      {}
                    )
                  ).map(([category, items]) => (
                    <div key={category} className="mb-5 last:mb-0">
                      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {items.map((a) => {
                          const qty = assemblyQty[a.id] || 0;
                          return (
                            <div
                              key={a.id}
                              className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                                qty > 0
                                  ? "border-orange-300 bg-orange-50/50"
                                  : "border-slate-200"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-800">{a.name}</p>
                                <p className="text-xs leading-relaxed text-slate-500">
                                  {a.includes}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="hidden text-xs text-slate-400 sm:inline">
                                  ${a.material} + {a.laborHours}h / {a.unit}
                                </span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="1"
                                  value={qty || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    setAssemblyQty((prev) => ({
                                      ...prev,
                                      [a.id]: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") e.preventDefault();
                                  }}
                                  className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-center focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {assemblyTotals && (
                    <div className="mt-6 rounded-xl bg-slate-900 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400/80">
                            Takeoff total
                          </p>
                          <p className="mt-1 text-lg font-bold text-white">
                            $
                            {assemblyTotals.materialCost.toLocaleString("en-US", {
                              maximumFractionDigits: 0,
                            })}{" "}
                            material ·{" "}
                            {assemblyTotals.laborHours.toLocaleString("en-US", {
                              maximumFractionDigits: 1,
                            })}{" "}
                            hours
                          </p>
                          {formData.laborRate > 0 && (
                            <p className="mt-0.5 text-sm text-slate-400">
                              ≈ $
                              {(
                                assemblyTotals.materialCost +
                                assemblyTotals.laborHours * formData.laborRate
                              ).toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                              cost at your ${formData.laborRate}/hr
                            </p>
                          )}
                        </div>
                      </div>

                      <details className="group mt-4">
                        <summary className="cursor-pointer list-none text-sm font-semibold text-orange-400 hover:text-orange-300">
                          <span className="group-open:hidden">Show the math →</span>
                          <span className="hidden group-open:inline">Hide the math ↑</span>
                        </summary>
                        <div className="mt-3 space-y-1.5">
                          {assemblyTotals.lines.map((l) => (
                            <div
                              key={l.assembly.id}
                              className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-1.5 text-sm"
                            >
                              <span className="text-slate-300">
                                {l.quantity} × {l.assembly.name}
                              </span>
                              <span className="text-slate-400">
                                ${l.material.toLocaleString("en-US", { maximumFractionDigits: 0 })} ·{" "}
                                {l.laborHours.toFixed(1)}h
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
                          <strong>These are generic starting rates, not market data.</strong>{" "}
                          Material prices and crew productivity vary a lot by region and
                          supplier. Adjust anything that doesn&apos;t match your numbers —
                          your own rates will always beat ours.
                        </p>
                      </details>
                    </div>
                  )}
                </div>
              )}

              {/* Trade-Specific Metrics Section (TRADE mode only) */}
              {formData.tradeType && (
                <div className="bg-orange-50/50 rounded-2xl border border-orange-200 shadow-sm p-5 sm:p-8">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-orange-200">
                    <span className="text-2xl">
                      {getTradeConfig(formData.tradeType).icon}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      {getTradeConfig(formData.tradeType).label} Metrics
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getTradeSpecificMetrics(formData.tradeType).map((metric) => (
                      <div key={metric.key}>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          {metric.label} ({metric.unit})
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={tradeMetrics[metric.key] || ""}
                          onChange={(e) =>
                            handleTradeMetricChange(metric.key, parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          step={metric.type === "number" ? "1" : "0.01"}
                          placeholder="0"
                          title={metric.description}
                          className="w-full rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                        />
                        <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Suggested estimate derived from the quantities above.
                      Shown with full arithmetic and applied only on click —
                      never silently written over the user's own numbers. */}
                  {estimate && (
                    <div className="mt-6 rounded-xl border border-slate-300 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            Suggested from your takeoff
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            <span className="font-semibold text-slate-900">
                              ${estimate.materialCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>{" "}
                            material ·{" "}
                            <span className="font-semibold text-slate-900">
                              {estimate.laborHours.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                            </span>{" "}
                            labor hours
                            {formData.laborRate > 0 && (
                              <>
                                {" "}(≈ $
                                {(estimate.laborHours * formData.laborRate).toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                                at your ${formData.laborRate}/hr)
                              </>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={applyEstimate}
                          className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Use these numbers
                        </button>
                      </div>

                      {formData.laborRate <= 0 && (
                        <p className="mt-3 text-xs text-slate-500">
                          Set your labor rate below and the hours above will price
                          themselves.
                        </p>
                      )}

                      <details className="mt-4 group">
                        <summary className="cursor-pointer list-none text-sm font-semibold text-orange-600 hover:text-orange-700">
                          <span className="group-open:hidden">Show the math →</span>
                          <span className="hidden group-open:inline">Hide the math ↑</span>
                        </summary>

                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-widest text-slate-400">
                                <th className="py-2 font-semibold">Input</th>
                                <th className="py-2 font-semibold">Qty</th>
                                <th className="py-2 font-semibold">Material</th>
                                <th className="py-2 font-semibold">Hours</th>
                              </tr>
                            </thead>
                            <tbody>
                              {estimate.lines.map((line) => (
                                <tr key={line.metricKey} className="border-b border-slate-100">
                                  <td className="py-2">
                                    <div className="font-medium text-slate-800">{line.label}</div>
                                    {line.note && (
                                      <div className="text-xs text-slate-500">{line.note}</div>
                                    )}
                                  </td>
                                  <td className="py-2 whitespace-nowrap text-slate-600">
                                    {line.quantity} {line.unit}
                                  </td>
                                  <td className="py-2 whitespace-nowrap text-slate-600">
                                    {line.materialRate > 0 ? (
                                      <>
                                        × ${line.materialRate} ={" "}
                                        <span className="font-medium text-slate-900">
                                          ${line.material.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className="py-2 whitespace-nowrap text-slate-600">
                                    {line.laborRate > 0 ? (
                                      <>
                                        × {line.laborRate} ={" "}
                                        <span className="font-medium text-slate-900">
                                          {line.laborHours.toFixed(1)} hrs
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {estimate.adjustments.length > 0 && (
                          <ul className="mt-3 space-y-1 text-xs text-slate-600">
                            {estimate.adjustments.map((a) => (
                              <li key={a}>• {a}</li>
                            ))}
                          </ul>
                        )}

                        <p className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs leading-relaxed text-amber-900">
                          <strong>These are generic starting rates, not market
                          data.</strong> Material prices and crew productivity vary a
                          lot by region, supplier, and job. Treat this as a sanity
                          check against your own numbers — never as the bid itself.
                        </p>
                      </details>
                    </div>
                  )}

                  {!estimate && hasCostBasis(formData.tradeType) && (
                    <p className="mt-6 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                      Enter quantities above and we&apos;ll suggest material cost and
                      labor hours, with the arithmetic shown.
                    </p>
                  )}
                </div>
              )}

              {/* Line Items Section (TRADE mode only) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Line Items</h2>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start">
                      {formData.tradeType ? (
                        <select
                          value={item.category}
                          onChange={(e) => updateLineItem(item.id, "category", e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4 text-sm"
                        >
                          <option value="">Select category...</option>
                          {getTradeConfig(formData.tradeType).costCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Category"
                          value={item.category}
                          onChange={(e) => updateLineItem(item.id, "category", e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4 text-sm"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4 text-sm"
                      />
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => updateLineItem(item.id, "qty", parseFloat(e.target.value) || 1)}
                        className="w-16 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4 text-sm"
                      />
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-24 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4 text-sm"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="text-slate-400 hover:text-red-500 text-sm px-2 py-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Markup & Margins Section (Both modes) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Markup & Margins</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Overhead (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="overheadPercent"
                  value={formData.overheadPercent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Profit (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="profitPercent"
                  value={formData.profitPercent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contingency (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="contingencyPercent"
                  value={formData.contingencyPercent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            Sidebar: Bid Summary
            ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white rounded-2xl border border-slate-200 shadow-lg p-5 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Bid Summary</h3>

            {/* GC: Sub Bid Breakdown */}
            {isGC && selectedTrades.length > 0 && (
              <div className="mb-6 pb-4 border-b border-slate-200">
                <p className="text-xs font-medium text-slate-600 uppercase mb-3">Sub Bids</p>
                <div className="space-y-2">
                  {selectedTrades.map((tradeId) => {
                    const config = TRADE_CONFIGS[tradeId];
                    const amount = subBids[tradeId]?.bidAmount || 0;
                    return (
                      <div key={tradeId} className="flex justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <span className="text-base">{TRADE_ICONS[tradeId]}</span>
                          {config.label}
                        </span>
                        <span className={`font-semibold ${amount > 0 ? "text-slate-900" : "text-slate-300"}`}>
                          ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">Sub Total</span>
                    <span className="font-bold text-slate-900">
                      ${calculations.subTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TRADE: Trade Metrics Summary */}
            {!isGC && formData.tradeType && Object.keys(tradeMetrics).length > 0 && (
              <div className="mb-6 pb-4 border-b border-slate-200">
                <p className="text-xs font-medium text-slate-600 uppercase mb-3">Trade Metrics</p>
                <div className="space-y-2">
                  {Object.entries(tradeMetrics)
                    .filter(([_, value]) => value !== 0)
                    .map(([key, value]) => {
                      const metric = getTradeSpecificMetrics(formData.tradeType).find(
                        (m) => m.key === key
                      );
                      return metric ? (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-slate-500">{metric.label}</span>
                          <span className="font-semibold text-slate-900">
                            {value} {metric.unit}
                          </span>
                        </div>
                      ) : null;
                    })}
                </div>
              </div>
            )}

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ${calculations.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {isGC && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Management Fee ({formData.gcManagementPercent}%)</span>
                  <span className="font-semibold text-blue-600">
                    ${calculations.managementFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-500">Overhead ({formData.overheadPercent}%)</span>
                <span className="font-semibold text-slate-900">
                  ${calculations.overhead.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Profit ({formData.profitPercent}%)</span>
                <span className="font-semibold text-orange-600">
                  ${calculations.profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contingency ({formData.contingencyPercent}%)</span>
                <span className="font-semibold text-slate-900">
                  ${calculations.contingency.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <span className="font-bold text-slate-900">Total Bid</span>
                <span className="text-3xl font-black text-slate-900">
                  ${calculations.totalBid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs text-slate-500">Profit Margin</p>
                <p className="text-2xl font-bold text-slate-900">{calculations.profitMargin.toFixed(1)}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl py-3.5 font-bold transition-colors disabled:bg-slate-400"
              >
                {submitting ? "Creating..." : "Create Bid"}
              </button>
              <Link
                href="/app/bids"
                className="block text-center border border-slate-200 text-slate-700 rounded-xl py-3.5 font-semibold transition-colors hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>

        {/* ─── New client modal ───────────────────────────────────
            Deliberately minimal: only the name is required. A contractor
            standing in a driveway shouldn't have to fill an address form
            to price the job. The rest can be added later from Clients. */}
        {showNewClient && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !savingClient && setShowNewClient(false)}
            />
            <div
              className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
              onKeyDown={(e) => {
                // This modal lives inside the bid <form>. Without this,
                // Enter in any field would submit the bid instead of
                // saving the client.
                if (e.key === "Enter") e.preventDefault();
              }}
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">New client</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Only a name is required — you can fill in the rest later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !savingClient && setShowNewClient(false)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {clientError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {clientError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    autoFocus
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        createClient();
                      }
                    }}
                    placeholder="Dave Miller"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Company
                  </label>
                  <input
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    placeholder="Miller Construction"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      inputMode="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="dave@example.com"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={createClient}
                  disabled={savingClient || !newClient.name.trim()}
                  className="flex-1 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {savingClient ? "Saving…" : "Save & use"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewClient(false)}
                  disabled={savingClient}
                  className="rounded-lg border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Mobile running total ───────────────────────────────
            On desktop the summary card is sticky in the right column.
            On a phone it lands below the entire form, so the number the
            contractor is working toward scrolls out of sight while they
            type. This pins it above the bottom nav instead. */}
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-slate-700 bg-slate-900 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total bid
              </p>
              <p className="truncate text-xl font-black text-white">
                $
                {calculations.totalBid.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Margin
                </p>
                <p className="text-sm font-bold text-orange-400">
                  {calculations.profitMargin.toFixed(1)}%
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="shrink-0 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors disabled:bg-slate-600"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
