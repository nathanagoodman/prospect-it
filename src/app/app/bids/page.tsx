"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Bid {
  id: string;
  jobName: string;
  clientId: string | null;
  totalBid: number;
  profitMargin: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
}

export default function BidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const res = await fetch("/api/bids");
      const data = (await res.json()) as Bid[];
      setBids(data);
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: { [key: string]: string } = {
    DRAFT: "bg-slate-100 text-slate-800",
    READY: "bg-blue-100 text-blue-800",
    SUBMITTED: "bg-purple-100 text-purple-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const statusBgColors: { [key: string]: string } = {
    DRAFT: "bg-slate-50",
    READY: "bg-blue-50",
    SUBMITTED: "bg-purple-50",
    ACCEPTED: "bg-green-50",
    REJECTED: "bg-red-50",
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading bids...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Bids</h1>
          <p className="text-slate-500 font-medium mt-2">Manage and track all your bids</p>
        </div>
        <Link
          href="/app/bids/new"
          className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          + New Bid
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-orange-500">
          <p className="text-slate-600 text-sm font-medium">Total Bids</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{bids.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-blue-500">
          <p className="text-slate-600 text-sm font-medium">Total Value</p>
          <p className="text-4xl font-black text-slate-900 mt-2">
            ${(bids.reduce((sum, b) => sum + b.totalBid, 0) / 1000).toFixed(0)}k
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-purple-500">
          <p className="text-slate-600 text-sm font-medium">Avg. Margin</p>
          <p className="text-4xl font-black text-slate-900 mt-2">
            {(bids.reduce((sum, b) => sum + b.profitMargin, 0) / Math.max(bids.length, 1)).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-green-500">
          <p className="text-slate-600 text-sm font-medium">Accepted</p>
          <p className="text-4xl font-black text-slate-900 mt-2">
            {bids.filter((b) => b.status === "ACCEPTED").length}
          </p>
        </div>
      </div>

      {/* Bids Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {bids.length > 0 ? (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Job Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Bid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Profit Margin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bids.map((bid) => (
                <tr
                  key={bid.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link href={`/app/bids/${bid.id}`} className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                      {bid.jobName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">${bid.totalBid.toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{bid.profitMargin.toFixed(1)}%</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[bid.status] || "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {bid.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {bid.dueDate ? new Date(bid.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(bid.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/app/invoices/new?bidId=${bid.id}&type=ESTIMATE`}
                        className="px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Estimate
                      </Link>
                      <Link
                        href={`/app/invoices/new?bidId=${bid.id}&type=INVOICE`}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Invoice
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No bids yet</h3>
            <p className="text-slate-500 font-medium mb-4">Create your first bid to get started</p>
            <Link
              href="/app/bids/new"
              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Create Your First Bid
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
