"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
}

interface CompanyProfile {
  paymentTerms: string | null;
  defaultNotes: string | null;
}

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bidId = searchParams.get("bidId");
  const typeParam = searchParams.get("type");

  const [docType, setDocType] = useState<"ESTIMATE" | "INVOICE">(
    typeParam === "INVOICE" ? "INVOICE" : "ESTIMATE"
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    clientCity: "",
    clientState: "",
    clientZip: "",
    clientPhone: "",
    projectName: "",
    projectDescription: "",
    taxRate: 0,
    discount: 0,
    dueDate: "",
    notes: "",
    terms: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, profileRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/company-profile"),
        ]);
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data);
        }
        if (profileRes.ok) {
          const profile: CompanyProfile = await profileRes.json();
          setForm((prev) => ({
            ...prev,
            terms: profile.paymentTerms || "",
            notes: profile.defaultNotes || "",
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchBid = async () => {
      if (!bidId) return;
      try {
        const res = await fetch(`/api/bids/${bidId}`);
        if (res.ok) {
          const bid = await res.json();
          setForm((prev) => ({
            ...prev,
            projectName: bid.jobName || "",
            projectDescription: bid.description || "",
          }));

          // Build customer-facing line items from the bid.
          //
          // Overhead, profit, and contingency are deliberately NOT listed
          // separately — that would hand the customer an itemized breakdown
          // of your margin. Instead the markup is distributed proportionally
          // across the real cost lines, so the lines still sum to the bid
          // total but read as ordinary prices.
          const costLines: { description: string; base: number }[] = [];

          if (Array.isArray(bid.lineItems) && bid.lineItems.length > 0) {
            // Prefer the contractor's own itemization when it exists.
            for (const li of bid.lineItems) {
              const base = (li.quantity || 0) * (li.unitPrice || 0);
              if (base > 0) {
                costLines.push({
                  description: li.description || li.category || "Work",
                  base,
                });
              }
            }
          } else {
            if (bid.materialCost > 0) costLines.push({ description: "Materials", base: bid.materialCost });
            if (bid.laborCost > 0) costLines.push({ description: `Labor (${bid.laborHours || 0} hrs)`, base: bid.laborCost });
            if (bid.equipmentCost > 0) costLines.push({ description: "Equipment", base: bid.equipmentCost });
            if (bid.subcontractorCost > 0) costLines.push({ description: "Subcontractor", base: bid.subcontractorCost });
            if (bid.permitCost > 0) costLines.push({ description: "Permits & fees", base: bid.permitCost });
          }

          const baseTotal = costLines.reduce((sum, l) => sum + l.base, 0);
          // Scale cost lines up to the quoted total so the customer sees the
          // agreed price without seeing how it was composed.
          const markup =
            baseTotal > 0 && bid.totalBid > 0 ? bid.totalBid / baseTotal : 1;

          const items: LineItem[] = costLines.map((l) => ({
            description: l.description,
            quantity: 1,
            unitPrice: Math.round(l.base * markup * 100) / 100,
          }));

          // Absorb any rounding drift into the last line so the invoice
          // total matches the bid exactly.
          if (items.length > 0) {
            const sum = items.reduce((s, i) => s + i.unitPrice, 0);
            const drift = Math.round((bid.totalBid - sum) * 100) / 100;
            if (drift !== 0) {
              items[items.length - 1].unitPrice =
                Math.round((items[items.length - 1].unitPrice + drift) * 100) / 100;
            }
            setLineItems(items);
          }

          // Set client if bid has one
          if (bid.clientId) {
            setSelectedClientId(bid.clientId);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    fetchBid();
  }, [bidId]);

  // When a client is selected, populate client fields
  useEffect(() => {
    if (!selectedClientId) return;
    const client = clients.find((c) => c.id === selectedClientId);
    if (client) {
      setForm((prev) => ({
        ...prev,
        clientName: client.company || client.name,
        clientEmail: client.email || "",
        clientAddress: client.address || "",
        clientCity: client.city || "",
        clientState: client.state || "",
        clientZip: client.zip || "",
        clientPhone: client.phone || "",
      }));
    }
  }, [selectedClientId, clients]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (form.taxRate / 100);
  const total = subtotal + taxAmount - form.discount;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const handleSubmit = async () => {
    if (!form.clientName || !form.projectName) {
      setError("Client name and project name are required");
      return;
    }
    if (lineItems.every((item) => !item.description)) {
      setError("Add at least one line item");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type: docType,
          bidId: bidId || undefined,
          clientId: selectedClientId || undefined,
          lineItems: lineItems.filter((item) => item.description),
        }),
      });

      if (res.ok) {
        const invoice = await res.json();
        router.push(`/app/invoices/${invoice.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create document");
      }
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-900 font-medium mb-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">New {docType === "ESTIMATE" ? "Estimate" : "Invoice"}</h1>
        <p className="text-slate-500 font-medium mt-2">Fill in the details below to create a professional document</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Document Type */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-slate-900 mb-4">Document Type</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["ESTIMATE", "INVOICE"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setDocType(type)}
                  className={`p-5 border-2 rounded-xl transition-all flex flex-col items-center gap-2 ${
                    docType === type ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <svg className="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {type === "ESTIMATE" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    )}
                  </svg>
                  <span className="font-bold text-slate-900">{type === "ESTIMATE" ? "Estimate" : "Invoice"}</span>
                  <span className="text-xs text-slate-500">{type === "ESTIMATE" ? "Quote or proposal" : "Bill for services"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Client */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-slate-900 mb-4">Client Information</h2>
            {clients.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Existing Client</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">— Or enter manually below —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.company || c.name} {c.company ? `(${c.name})` : ""}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Client / Company Name", name: "clientName", placeholder: "Acme Corp" },
                { label: "Email", name: "clientEmail", placeholder: "client@company.com" },
                { label: "Phone", name: "clientPhone", placeholder: "(555) 000-0000" },
                { label: "Address", name: "clientAddress", placeholder: "456 Oak Ave" },
                { label: "City", name: "clientCity", placeholder: "City" },
                { label: "State", name: "clientState", placeholder: "State" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
                  <input
                    type="text"
                    value={(form as any)[field.name]}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Project */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-slate-900 mb-4">Project Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                <input
                  type="text" value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  placeholder="Kitchen Renovation — 123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={form.projectDescription}
                  onChange={(e) => setForm({ ...form, projectDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                  placeholder="Scope of work description..."
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight text-slate-900">Line Items</h2>
              <button
                onClick={addLineItem}
                className="px-4 py-2 text-sm font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1" />
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-6">
                    <input
                      type="text" value={item.description}
                      onChange={(e) => updateLineItem(i, "description", e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-sm"
                      placeholder="Description"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number" value={item.quantity} min={0} step={0.5}
                      onChange={(e) => updateLineItem(i, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number" value={item.unitPrice} min={0} step={0.01}
                      onChange={(e) => updateLineItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-sm"
                    />
                  </div>
                  <div className="col-span-1 text-right text-sm font-semibold text-slate-900">
                    {fmt(item.quantity * item.unitPrice)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeLineItem(i)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      disabled={lineItems.length <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax, Notes, Terms */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-slate-900 mb-4">Additional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number" value={form.taxRate} min={0} step={0.1}
                  onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Discount ($)</label>
                <input
                  type="number" value={form.discount} min={0} step={0.01}
                  onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                <input
                  type="date" value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                  placeholder="Additional notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Terms</label>
                <textarea
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                  placeholder="Payment terms..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sticky top-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black tracking-tight text-slate-900">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900">{fmt(subtotal)}</span>
              </div>
              {form.taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax ({form.taxRate}%)</span>
                  <span className="font-semibold text-slate-900">{fmt(taxAmount)}</span>
                </div>
              )}
              {form.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-semibold text-red-600">-{fmt(form.discount)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-slate-900">{fmt(total)}</span>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-medium transition-colors"
            >
              {saving ? "Creating..." : `Create ${docType === "ESTIMATE" ? "Estimate" : "Invoice"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={
      <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    }>
      <NewInvoiceForm />
    </Suspense>
  );
}
