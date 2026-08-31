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

interface UserData {
  tier: "GC" | "TRADE";
  tradeType?: string;
  enabledTrades: string[];
  name?: string;
}

const TRADE_NAMES: { [key: string]: string } = {
  electrical: "Electrical",
  plumbing: "Plumbing",
  hvac: "HVAC",
  roofing: "Roofing",
  framing: "Framing",
  drywall: "Drywall",
  painting: "Painting",
  flooring: "Flooring",
  masonry: "Masonry",
  concrete: "Concrete",
  landscaping: "Landscaping",
  carpentry: "Carpentry",
  general: "General",
  steel: "Steel",
  demolition: "Demolition",
};

export default function Dashboard() {
  const [bids, setBids] = useState<Bid[]>([]);
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

        // These endpoints all exist and work — previously two of the four
        // stats were hardcoded to 0, so the dashboard reported zero clients
        // to users who had added dozens.
        const [bidsRes, jobsRes, clientsRes] = await Promise.all([
          fetch("/api/bids"),
          fetch("/api/jobs"),
          fetch("/api/clients"),
        ]);

        const bidsData = (bidsRes.ok ? await bidsRes.json() : []) as Bid[];
        const jobsData = jobsRes.ok ? await jobsRes.json() : [];
        const clientsData = clientsRes.ok ? await clientsRes.json() : [];

        setBids(bidsData.slice(0, 5)); // Recent 5

        // Win rate should measure decided bids, not drafts. Counting
        // drafts in the denominator pins it near 0% forever.
        const decided = bidsData.filter(
          (b) => b.status === "ACCEPTED" || b.status === "REJECTED"
        );
        const accepted = decided.filter((b) => b.status === "ACCEPTED").length;
        const winRate = decided.length > 0 ? (accepted / decided.length) * 100 : 0;

        const activeJobs = Array.isArray(jobsData)
          ? jobsData.filter(
              (j: { status?: string }) =>
                j.status === "IN_PROGRESS" ||
                j.status === "NOT_STARTED" ||
                j.status === "PUNCH_LIST"
            ).length
          : 0;

        setStats({
          totalBids: bidsData.length,
          activeJobs,
          totalClients: Array.isArray(clientsData) ? clientsData.length : 0,
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
    DRAFT: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
    READY: "bg-white text-slate-800 ring-1 ring-inset ring-slate-300",
    SUBMITTED: "bg-slate-800 text-white ring-1 ring-inset ring-slate-800",
    ACCEPTED: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
    REJECTED: "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200",
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date().toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-slate-500 font-medium mt-2">{getFormattedDate()}</p>
      </div>

      {/* Stats Cards - Dynamic based on tier.

          These used to carry four different colored left borders (orange,
          blue, purple, green), which told the eye nothing about which
          number mattered. Counts are now neutral; win rate is the only one
          that can be good or bad, so it's the only one that gets color —
          and the color follows the actual value rather than being fixed. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
        {[
          {
            label: user?.tier === "GC" ? "Projects Managed" : "Bids Submitted",
            value: stats.totalBids,
          },
          { label: "Active Jobs", value: stats.activeJobs },
          { label: "Total Clients", value: stats.totalClients },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {s.label}
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-2 tabular-nums">
              {s.value}
            </p>
          </div>
        ))}
        <div
          className={`rounded-2xl border shadow-sm p-6 ${
            stats.winRate >= 40
              ? "border-emerald-200 bg-emerald-50/50"
              : stats.winRate > 0
                ? "border-amber-200 bg-amber-50/50"
                : "border-slate-200 bg-white"
          }`}
        >
          <p
            className={`text-[11px] font-bold uppercase tracking-wider ${
              stats.winRate >= 40
                ? "text-emerald-700"
                : stats.winRate > 0
                  ? "text-amber-700"
                  : "text-slate-500"
            }`}
          >
            Win Rate
          </p>
          <p
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 tabular-nums ${
              stats.winRate >= 40
                ? "text-emerald-800"
                : stats.winRate > 0
                  ? "text-amber-800"
                  : "text-slate-900"
            }`}
          >
            {stats.winRate}%
          </p>
        </div>
      </div>

      {/* Your Trades Section */}
      {user?.enabledTrades && user.enabledTrades.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your Trades</h2>
            <Link
              href="/app/settings"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
            >
              Manage →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.enabledTrades.map((trade) => (
              <div
                key={trade}
                className="bg-white rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {TRADE_NAMES[trade] || trade}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Card */}
      {user?.tier === "TRADE" && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">Quick Bid</h3>
                <p className="text-slate-500 font-medium mt-1">Start a new bid in your primary trade</p>
              </div>
              <Link
                href="/app/bids/new"
                className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Create Bid
              </Link>
            </div>
          </div>
        </div>
      )}

      {user?.tier === "GC" && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">Sub Coordination</h3>
                <p className="text-slate-500 font-medium mt-1">Manage your subcontractors and delegated work</p>
              </div>
              <Link
                href="/app/subs"
                className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                View Subs
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bids Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recent Bids</h2>
          <Link
            href="/app/bids"
            className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {bids.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Job</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Bid</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Margin</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{bid.jobName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">${bid.totalBid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{bid.profitMargin.toFixed(1)}%</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Recent Jobs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recent Jobs</h2>
          <Link
            href="/app/jobs"
            className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No jobs yet</h3>
          <p className="text-slate-500 font-medium mb-4">Create your first job to track progress</p>
          <Link
            href="/app/jobs"
            className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Create Your First Job
          </Link>
        </div>
      </div>
    </div>
  );
}
