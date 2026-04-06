"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TRADE_CONFIGS,
  getTradeConfig,
  getTradeSpecificMetrics,
  ALL_METRICS,
  type TradeType,
} from "@/lib/trades";

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

export default function NewBidPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", category: "", description: "", qty: 1, unitPrice: 0 },
  ]);

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
  });

  const [tradeMetrics, setTradeMetrics] = useState<TradeMetrics>({});

  // Calculated values
  const [calculations, setCalculations] = useState({
    laborCost: 0,
    subtotal: 0,
    overhead: 0,
    profit: 0,
    contingency: 0,
    totalBid: 0,
    profitMargin: 0,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    recalculateTotals();
  }, [formData, lineItems]);

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
    const laborCost = formData.laborHours * formData.laborRate;

    const subtotal =
      formData.materialCost +
      laborCost +
      formData.equipmentCost +
      formData.subcontractorCost +
      formData.permitCost;

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
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue = ["materialCost", "laborHours", "laborRate", "equipmentCost", "subcontractorCost", "permitCost", "overheadPercent", "profitPercent", "contingencyPercent"].includes(
      name
    )
      ? parseFloat(value) || 0
      : value;

    // When trade type changes, auto-set overhead/profit/contingency and reset trade metrics
    if (name === "tradeType") {
      const tradeConfig = getTradeConfig(value as string);
      setFormData((prev) => ({
        ...prev,
        tradeType: value,
        overheadPercent: tradeConfig.defaultOverhead,
        profitPercent: tradeConfig.defaultProfit,
        contingencyPercent: tradeConfig.defaultContingency,
      }));
      // Reset trade metrics when trade changes
      setTradeMetrics({});
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bidData = {
        ...formData,
        ...calculations,
        lineItems,
        tradeMetrics,
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

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Link href="/app/bids" className="text-orange-600 hover:text-orange-700">
            Bids
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">New Bid</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Create New Bid</h1>
        <p className="text-slate-500 mt-1">Fill in the details below to create a new bid</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Info Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
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
              <div className="grid grid-cols-2 gap-4">
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
                    {Object.values(TRADE_CONFIGS).map((config) => (
                      <option key={config.id} value={config.id}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
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

          {/* Cost Breakdown Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Cost Breakdown</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Material Cost ($)</label>
                <input
                  type="number"
                  name="materialCost"
                  value={formData.materialCost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Labor Hours</label>
                  <input
                    type="number"
                    name="laborHours"
                    value={formData.laborHours}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Labor Rate ($/hr)</label>
                  <input
                    type="number"
                    name="laborRate"
                    value={formData.laborRate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Equipment Cost ($)</label>
                  <input
                    type="number"
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

          {/* Markup & Margins Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Markup & Margins</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Overhead (%)</label>
                <input
                  type="number"
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

          {/* Trade-Specific Metrics Section */}
          {formData.tradeType && (
            <div className="bg-orange-50/50 rounded-2xl border border-orange-200 shadow-sm p-8">
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
            </div>
          )}

          {/* Line Items Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
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
              {lineItems.map((item, idx) => (
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
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => updateLineItem(item.id, "qty", parseFloat(e.target.value) || 1)}
                    className="w-16 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 bg-white py-3 px-4 text-sm"
                  />
                  <input
                    type="number"
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
        </div>

        {/* Calculation Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Bid Summary</h3>

            {/* Trade Metrics Summary */}
            {formData.tradeType && Object.keys(tradeMetrics).length > 0 && (
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
                <span className="font-semibold text-slate-900">${calculations.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Overhead ({formData.overheadPercent}%)</span>
                <span className="font-semibold text-slate-900">${calculations.overhead.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Profit ({formData.profitPercent}%)</span>
                <span className="font-semibold text-orange-600">${calculations.profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contingency ({formData.contingencyPercent}%)</span>
                <span className="font-semibold text-slate-900">${calculations.contingency.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <span className="font-bold text-slate-900">Total Bid</span>
                <span className="text-3xl font-black text-slate-900">${calculations.totalBid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
      </form>
    </div>
  );
}
