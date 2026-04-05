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
      <div className="p-8">
        <div className="text-center text-slate-500">Loading bids...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bids</h1>
          <p className="text-slate-500 mt-1">Manage and track all your bids</p>
        </div>
        <Link
          href="/app/bids/new"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + New Bid
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-600 uppercase">Total Bids</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{bids.length}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-600 uppercase">Total Value</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${bids.reduce((sum, b) => sum + b.totalBid, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-600 uppercase">Avg. Margin</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {(bids.reduce((sum, b) => sum + b.profitMargin, 0) / Math.max(bids.length, 1)).toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-600 uppercase">Accepted</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {bids.filter((b) => b.status === "ACCEPTED").length}
          </p>
        </div>
      </div>

      {/* Bids Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {bids.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Job Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Total Bid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Profit Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bids.map((bid) => (
                <tr
                  key={bid.id}
                  className={`hover:bg-slate-50 transition-colors ${statusBgColors[bid.status] || "bg-white"}`}
                >
                  <td className="px-6 py-4">
                    <Link href={`/app/bids/${bid.id}`} className="font-medium text-orange-600 hover:text-orange-700">
                      {bid.jobName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">${bid.totalBid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">{bid.profitMargin.toFixed(1)}%</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[bid.status] || "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {bid.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {bid.dueDate ? new Date(bid.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(bid.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No bids yet. Let's create your first one!</p>
            <Link
              href="/app/bids/new"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Your First Bid
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
