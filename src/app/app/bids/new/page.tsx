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
        <div className="flex items-center gap-2 mb-4">
          <Link href="/app/bids" className="text-orange-600 hover:text-orange-700">
            Bids
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">New Bid</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Bid</h1>
        <p className="text-slate-500 mt-1">Fill in the details below to create a new bid</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Info Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-4 border-b border-slate-200">Job Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Name *</label>
                <input
                  type="text"
                  name="jobName"
                  value={formData.jobName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Kitchen Remodel - Main Street"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Add project details..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trade Type *</label>
                  <select
                    name="tradeType"
                    value={formData.tradeType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Cost Breakdown Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-4 border-b border-slate-200">Cost Breakdown</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Material Cost ($)</label>
                <input
                  type="number"
                  name="materialCost"
                  value={formData.materialCost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Labor Hours</label>
                  <input
                    type="number"
                    name="laborHours"
                    value={formData.laborHours}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Labor Rate ($/hr)</label>
                  <input
                    type="number"
                    name="laborRate"
                    value={formData.laborRate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Equipment Cost ($)</label>
                  <input
                    type="number"
                    name="equipmentCost"
                    value={formData.equipmentCost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subcontractor ($)</label>
                  <input
                    type="number"
                    name="subcontractorCost"
                    value={formData.subcontractorCost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Permit Cost ($)</label>
                  <input
                    type="number"
                    name="permitCost"
                    value={formData.permitCost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Markup & Margins Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-4 border-b border-slate-200">Markup & Margins</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Overhead (%)</label>
                <input
                  type="number"
                  name="overheadPercent"
                  value={formData.overheadPercent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profit (%)</label>
                <input
                  type="number"
                  name="profitPercent"
                  value={formData.profitPercent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contingency (%)</label>
                <input
                  type="number"
                  name="contingencyPercent"
                  value={formData.contingencyPercent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Trade-Specific Metrics Section */}
          {formData.tradeType && (
            <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-orange-200">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                      className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line Items Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
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
                      className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  )}
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => updateLineItem(item.id, "qty", parseFloat(e.target.value) || 1)}
                    className="w-16 px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-600 hover:text-red-700 text-sm px-2 py-2"
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
          <div className="sticky top-8 bg-white rounded-lg border border-slate-200 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">Bid Summary</h3>

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
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-slate-600">{metric.label}</span>
                          <span className="font-medium text-slate-900">
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
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">${calculations.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Overhead ({formData.overheadPercent}%)</span>
                <span className="font-medium text-slate-900">${calculations.overhead.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Profit ({formData.profitPercent}%)</span>
                <span className="font-medium text-orange-600">${calculations.profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Contingency ({formData.contingencyPercent}%)</span>
                <span className="font-medium text-slate-900">${calculations.contingency.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <span className="font-bold text-slate-900">Total Bid</span>
                <span className="text-2xl font-bold text-orange-600">${calculations.totalBid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="text-xs text-slate-600">Profit Margin</p>
                <p className="text-2xl font-bold text-orange-600">{calculations.profitMargin.toFixed(1)}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {submitting ? "Creating..." : "Create Bid"}
              </button>
              <Link
                href="/app/bids"
                className="block text-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-3 rounded-lg transition-colors"
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
