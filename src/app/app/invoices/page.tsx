"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: "ESTIMATE" | "INVOICE";
  status: string;
  clientName: string;
  projectName: string;
  total: number;
  issueDate: string;
  dueDate: string | null;
}

const statusColors: { [key: string]: string } = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

const typeColors: { [key: string]: string } = {
  ESTIMATE: "bg-orange-100 text-orange-700",
  INVOICE: "bg-blue-100 text-blue-700",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ESTIMATE" | "INVOICE">("ALL");
  const router = useRouter();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "ALL" ? invoices : invoices.filter((i) => i.type === filter);

  const totalOutstanding = invoices
    .filter((i) => ["SENT", "VIEWED", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + i.total, 0);

  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.total, 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Invoices &amp; Estimates</h1>
          <p className="text-slate-500 font-medium mt-2">Create, manage, and download professional documents</p>
        </div>
        <Link
          href="/app/invoices/new"
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Document
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Documents", value: invoices.length, color: "border-l-slate-400" },
          { label: "Estimates", value: invoices.filter((i) => i.type === "ESTIMATE").length, color: "border-l-orange-500" },
          { label: "Outstanding", value: fmt(totalOutstanding), color: "border-l-blue-500" },
          { label: "Paid", value: fmt(totalPaid), color: "border-l-green-500" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm border-l-4 ${stat.color}`}>
            <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            <p className="text-2xl font-black tracking-tight text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {(["ALL", "ESTIMATE", "INVOICE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {f === "ALL" ? "All" : f === "ESTIMATE" ? "Estimates" : "Invoices"}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No documents yet</h3>
          <p className="text-sm text-slate-500 mb-6">Create your first estimate or invoice to get started.</p>
          <Link
            href="/app/invoices/new"
            className="inline-flex px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
          >
            Create Document
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Number</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => router.push(`/app/invoices/${inv.id}`)}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <span className="font-bold text-slate-900">{inv.invoiceNumber}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${typeColors[inv.type]}`}>
                      {inv.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-medium">{inv.clientName}</td>
                  <td className="p-4 text-sm text-slate-600">{inv.projectName}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[inv.status] || "bg-slate-100 text-slate-700"}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">{fmt(inv.total)}</td>
                  <td className="p-4 text-right text-sm text-slate-500">
                    {new Date(inv.issueDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
