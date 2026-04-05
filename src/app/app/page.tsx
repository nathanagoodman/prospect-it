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

interface Job {
  id: string;
  name: string;
  clientId: string;
  contractAmount: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

interface UserData {
  tier: "GC" | "TRADE";
  tradeType?: string;
  enabledTrades: string[];
  name?: string;
}

const TRADE_ICONS: { [key: string]: string } = {
  electrical: "⚡",
  plumbing: "🔧",
  hvac: "❄️",
  roofing: "🏠",
  framing: "🪵",
  drywall: "📋",
  painting: "🎨",
  flooring: "🪚",
  masonry: "🧱",
  concrete: "🪨",
  landscaping: "🌳",
  carpentry: "🔨",
  general: "🏗️",
  steel: "⚙️",
  demolition: "💥",
};

export default function Dashboard() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState({
    totalBids: 0,
    activeJobs: 0,
    totalClients: 0,
    winRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/user/settings");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // Fetch bids
        const bidsRes = await fetch("/api/bids");
        const bidsData = (await bidsRes.json()) as Bid[];
        setBids(bidsData.slice(0, 5)); // Recent 5

        // Calculate stats
        const acceptedBids = bidsData.filter((b) => b.status === "ACCEPTED").length;
        const winRate = bidsData.length > 0 ? (acceptedBids / bidsData.length) * 100 : 0;

        setStats({
          totalBids: bidsData.length,
          activeJobs: 0, // Will be updated when jobs API is available
          totalClients: 0, // Will be updated when clients are fetched
          winRate: Math.round(winRate),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusColors: { [key: string]: string } = {
    DRAFT: "bg-slate-100 text-slate-800",
    READY: "bg-blue-100 text-blue-800",
    SUBMITTED: "bg-purple-100 text-purple-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Cards - Dynamic based on tier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
          <p className="text-slate-600 text-sm font-medium">{user?.tier === "GC" ? "Projects Managed" : "Bids Submitted"}</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalBids}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <p className="text-slate-600 text-sm font-medium">Active Jobs</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.activeJobs}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <p className="text-slate-600 text-sm font-medium">Total Clients</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalClients}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <p className="text-slate-600 text-sm font-medium">Win Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.winRate}%</p>
        </div>
      </div>

      {/* Your Trades Section */}
      {user?.enabledTrades && user.enabledTrades.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Your Trades</h2>
            <Link
              href="/app/settings"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Manage →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {user.enabledTrades.map((trade) => (
              <div
                key={trade}
                className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{TRADE_ICONS[trade] || "🔧"}</span>
                <p className="text-xs font-medium text-slate-700 text-center capitalize">{trade}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Bid Card or Sub Coordination Card */}
      {user?.tier === "TRADE" && (
        <div className="mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-2">Quick Bid</h3>
            <p className="text-slate-300 text-sm mb-4">Start a new bid in your primary trade</p>
            <Link
              href="/app/bids/new"
              className="inline-block px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors"
            >
              Create Bid →
            </Link>
          </div>
        </div>
      )}

      {user?.tier === "GC" && (
        <div className="mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-2">Sub Coordination</h3>
            <p className="text-slate-300 text-sm mb-4">Manage your subcontractors and delegated work</p>
            <Link
              href="/app/subs"
              className="inline-block px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors"
            >
              View Subs →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Bids Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Recent Bids</h2>
          <Link
            href="/app/bids"
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {bids.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Total Bid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Margin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{bid.jobName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">${bid.totalBid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{bid.profitMargin.toFixed(1)}%</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[bid.status] || "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {bid.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {bid.dueDate ? new Date(bid.dueDate).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>No bids yet. Create your first bid to get started!</p>
              <Link href="/app/bids/new" className="text-orange-600 hover:text-orange-700 mt-2 inline-block">
                Create Bid →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Jobs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Recent Jobs</h2>
          <Link
            href="/app/jobs"
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
          <p>No jobs yet. Create your first job to track progress!</p>
          <Link href="/app/jobs" className="text-orange-600 hover:text-orange-700 mt-2 inline-block">
            Go to Jobs →
          </Link>
        </div>
      </div>
    </div>
  );
}
