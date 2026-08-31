"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// ─── Types ──────────────────────────────────────────────────

interface LeadNote {
  id: string;
  content: string;
  type: string;
  createdAt: string;
}

interface Lead {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  trade: string | null;
  source: string;
  stage: string;
  score: number;
  lastContactedAt: string | null;
  convertedAt: string | null;
  createdAt: string;
  notes: LeadNote[];
  _count: { notes: number };
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  role: string;
  tier: string;
  tradeType: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  loginCount: number;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
    trialEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  _count: {
    bids: number;
    jobs: number;
    clients: number;
    invoices: number;
    activities: number;
  };
}

interface ActivityRow {
  id: string;
  type: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  user: { id: string; name: string | null; email: string | null; company: string | null };
}

interface Stats {
  leads: {
    total: number;
    byStage: Record<string, number>;
    recentWeek: number;
    converted: number;
    conversionRate: number;
  };
  users: {
    total: number;
    newThisWeek: number;
    byPlan: Record<string, number>;
    byStatus: Record<string, number>;
    active7d: number;
    active30d: number;
    engagementRate: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    trialing: number;
    trialPipeline: number;
    paying: number;
  };
  product: {
    totalBids: number;
    bidsThisWeek: number;
    totalJobs: number;
    totalInvoices: number;
    totalBidValue: number;
    avgBidValue: number;
  };
}

// ─── Constants & helpers ────────────────────────────────────

const STAGES = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "TRIAL",
  "CONVERTED",
  "CHURNED",
] as const;

const STAGE_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  INTERESTED: "bg-purple-100 text-purple-700",
  TRIAL: "bg-orange-100 text-orange-700",
  CONVERTED: "bg-emerald-500 text-white",
  CHURNED: "bg-red-100 text-red-700",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  TRIALING: "bg-orange-100 text-orange-700",
  PAST_DUE: "bg-red-100 text-red-700",
  CANCELED: "bg-slate-200 text-slate-600",
  UNPAID: "bg-red-100 text-red-700",
};

const ACTIVITY_LABELS: Record<string, string> = {
  login: "Logged in",
  signup: "Signed up",
  bid_created: "Created a bid",
  bid_submitted: "Submitted a bid",
  job_created: "Created a job",
  invoice_created: "Created an invoice",
  client_created: "Added a client",
  subscription_started: "Started a subscription",
  subscription_canceled: "Canceled subscription",
};

const ACTIVITY_COLORS: Record<string, string> = {
  login: "bg-slate-100 text-slate-600",
  signup: "bg-blue-100 text-blue-700",
  bid_created: "bg-orange-100 text-orange-700",
  bid_submitted: "bg-orange-200 text-orange-800",
  job_created: "bg-purple-100 text-purple-700",
  invoice_created: "bg-emerald-100 text-emerald-700",
  client_created: "bg-sky-100 text-sky-700",
  subscription_started: "bg-emerald-500 text-white",
  subscription_canceled: "bg-red-100 text-red-700",
};

const money = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US");

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

function timeAgo(d: string | null): string {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Small presentational pieces ────────────────────────────

function KPI({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div
        className={`mt-2 text-2xl font-bold ${
          accent ? "text-orange-500" : "text-slate-900"
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center text-sm text-slate-400">{message}</div>
  );
}

// ─── Page ───────────────────────────────────────────────────

type Tab = "overview" | "pipeline" | "users" | "activity";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Could not load stats");
      setStats(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, []);

  useEffect(() => {
    loadStats().finally(() => setLoading(false));
  }, [loadStats]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "pipeline", label: "Pipeline" },
    { id: "users", label: "Users" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading…</div>
      ) : (
        <>
          {tab === "overview" && <OverviewTab stats={stats} />}
          {tab === "pipeline" && <PipelineTab onChange={loadStats} />}
          {tab === "users" && <UsersTab />}
          {tab === "activity" && <ActivityTab />}
        </>
      )}
    </main>
  );
}

// ─── Overview ───────────────────────────────────────────────

function OverviewTab({ stats }: { stats: Stats | null }) {
  if (!stats) return <EmptyState message="No data yet." />;

  const maxStage = Math.max(...Object.values(stats.leads.byStage), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Revenue
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPI
            label="MRR"
            value={money(stats.revenue.mrr)}
            sub={`${money(stats.revenue.arr)} ARR`}
            accent
          />
          <KPI
            label="Paying"
            value={stats.revenue.paying}
            sub="active subscriptions"
          />
          <KPI
            label="In Trial"
            value={stats.revenue.trialing}
            sub={`${money(stats.revenue.trialPipeline)}/mo if all convert`}
          />
          <KPI
            label="Conversion"
            value={`${stats.leads.conversionRate}%`}
            sub="leads → customers"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Growth &amp; Engagement
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPI
            label="Total Users"
            value={stats.users.total}
            sub={`+${stats.users.newThisWeek} this week`}
          />
          <KPI
            label="Active (7d)"
            value={stats.users.active7d}
            sub={`${stats.users.engagementRate}% of all users`}
          />
          <KPI
            label="Active (30d)"
            value={stats.users.active30d}
            sub="logged any activity"
          />
          <KPI
            label="Waitlist"
            value={stats.leads.total}
            sub={`+${stats.leads.recentWeek} this week`}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Product Usage
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPI
            label="Bids Created"
            value={stats.product.totalBids}
            sub={`+${stats.product.bidsThisWeek} this week`}
          />
          <KPI label="Jobs" value={stats.product.totalJobs} />
          <KPI label="Invoices" value={stats.product.totalInvoices} />
          <KPI
            label="Avg Bid Value"
            value={money(stats.product.avgBidValue)}
            sub={`${money(stats.product.totalBidValue)} total`}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Lead Pipeline">
          <div className="flex items-end gap-2">
            {STAGES.map((s) => {
              const count = stats.leads.byStage[s] || 0;
              const height = Math.max((count / maxStage) * 130, 6);
              return (
                <div key={s} className="flex-1 text-center">
                  <div className="mb-1 text-sm font-bold text-slate-900">
                    {count}
                  </div>
                  <div
                    className={`mx-auto w-full max-w-[52px] rounded-t-lg ${
                      s === "CONVERTED"
                        ? "bg-emerald-500"
                        : s === "CHURNED"
                          ? "bg-red-300"
                          : "bg-orange-400/40"
                    }`}
                    style={{ height: `${height}px` }}
                  />
                  <div className="mt-2 text-[9px] font-medium uppercase tracking-wider text-slate-400">
                    {s}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Subscriptions by Plan">
          <div className="space-y-3">
            {[
              { key: "GC_ELITE", label: "GC Elite", price: 249 },
              { key: "GC_PRO", label: "GC Pro", price: 99 },
              { key: "PRO", label: "Pro", price: 49 },
              { key: "NONE", label: "No plan", price: 0 },
            ].map(({ key, label, price }) => {
              const count = stats.users.byPlan[key] || 0;
              const total = Math.max(stats.users.total, 1);
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {label}
                      {price > 0 && (
                        <span className="ml-1.5 text-xs text-slate-400">
                          ${price}/mo
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        key === "NONE" ? "bg-slate-300" : "bg-orange-500"
                      }`}
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Pipeline ───────────────────────────────────────────────

function PipelineTab({ onChange }: { onChange: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Debounce the search box so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ stage: stageFilter });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/leads?${params}`);
      if (!res.ok) throw new Error("Could not load leads");
      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.pagination.total);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load leads");
    } finally {
      setLoading(false);
    }
  }, [stageFilter, search]);

  useEffect(() => {
    let ignore = false;
    // Guard against out-of-order responses from the debounced search.
    load().then(() => {
      if (ignore) return;
    });
    return () => {
      ignore = true;
    };
  }, [load]);

  // Derive the open lead from the list so it always reflects fresh data.
  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selected) ?? null,
    [leads, selected]
  );

  const updateLead = async (id: string, data: Partial<Lead>) => {
    const res = await fetch("/api/admin/leads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) {
      setLoadError("Could not save that change.");
      return;
    }
    await load();
    onChange();
  };

  const addNote = async (leadId: string, content: string, type: string) => {
    const res = await fetch("/api/admin/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, content, type }),
    });
    if (!res.ok) {
      setLoadError("Could not add that note.");
      return;
    }
    await load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {["all", ...STAGES].map((s) => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              stageFilter === s
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search email, name, company…"
          className="ml-auto w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-3 text-xs font-semibold text-slate-500">
          {total} lead{total === 1 ? "" : "s"}
        </div>
        {loading ? (
          <EmptyState message="Loading…" />
        ) : leads.length === 0 ? (
          <EmptyState message="No leads yet. They'll appear here as people join the waitlist." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-widest text-slate-400">
                <th className="px-6 py-3 font-semibold">Contact</th>
                <th className="px-6 py-3 font-semibold">Stage</th>
                <th className="px-6 py-3 font-semibold">Trade</th>
                <th className="px-6 py-3 font-semibold">Joined</th>
                <th className="px-6 py-3 font-semibold">Last Contact</th>
                <th className="px-6 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelected(lead.id)}
                  className="cursor-pointer border-b border-slate-50 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-3">
                    <div className="font-semibold text-slate-900">
                      {lead.email}
                    </div>
                    {(lead.name || lead.company) && (
                      <div className="text-xs text-slate-500">
                        {[lead.name, lead.company].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        STAGE_COLORS[lead.stage]
                      }`}
                    >
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {lead.trade || "—"}
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {timeAgo(lead.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {timeAgo(lead.lastContactedAt)}
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {lead._count.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedLead && (
        // Keyed by lead id so switching leads remounts the panel — otherwise
        // the edit draft from the previous lead persists and can be saved
        // onto the newly opened one.
        <LeadDetail
          key={selectedLead.id}
          lead={selectedLead}
          onClose={() => setSelected(null)}
          onUpdate={updateLead}
          onAddNote={addNote}
        />
      )}
    </div>
  );
}

function LeadDetail({
  lead,
  onClose,
  onUpdate,
  onAddNote,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Lead>) => Promise<void>;
  onAddNote: (id: string, content: string, type: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: lead.name || "",
    company: lead.company || "",
    trade: lead.trade || "",
  });
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [saving, setSaving] = useState(false);

  const submitNote = async () => {
    if (!noteText.trim() || saving) return;
    setSaving(true);
    await onAddNote(lead.id, noteText, noteType);
    setNoteText("");
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative ml-auto flex w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <div className="font-bold text-slate-900">{lead.email}</div>
            <div className="text-xs text-slate-500">
              Joined {fmtDate(lead.createdAt)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* Contact */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Contact
              </h3>
              <button
                onClick={() => setEditing(!editing)}
                className="text-xs font-semibold text-orange-600 hover:underline"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
            {editing ? (
              <div className="space-y-2">
                {(["name", "company", "trade"] as const).map((f) => (
                  <input
                    key={f}
                    value={draft[f]}
                    onChange={(e) =>
                      setDraft({ ...draft, [f]: e.target.value })
                    }
                    placeholder={f[0].toUpperCase() + f.slice(1)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                ))}
                <button
                  onClick={async () => {
                    await onUpdate(lead.id, draft);
                    setEditing(false);
                  }}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Name", lead.name],
                  ["Company", lead.company],
                  ["Trade", lead.trade],
                  ["Source", lead.source],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="text-[10px] uppercase tracking-widest text-slate-400">
                      {label}
                    </dt>
                    <dd className="mt-0.5 font-medium text-slate-800">
                      {value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          {/* Stage */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Pipeline Stage
            </h3>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdate(lead.id, { stage: s })}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition ${
                    lead.stage === s
                      ? STAGE_COLORS[s]
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Add activity */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Log Activity
            </h3>
            <div className="flex gap-2">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-orange-500"
              >
                <option value="note">Note</option>
                <option value="email">Email</option>
                <option value="call">Call</option>
              </select>
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitNote()}
                placeholder="What happened?"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
              />
              <button
                onClick={submitNote}
                disabled={saving || !noteText.trim()}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </section>

          {/* History */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              History ({lead.notes.length})
            </h3>
            {lead.notes.length === 0 ? (
              <p className="text-sm text-slate-400">No activity logged yet.</p>
            ) : (
              <div className="space-y-2">
                {lead.notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          n.type === "email"
                            ? "bg-blue-100 text-blue-700"
                            : n.type === "call"
                              ? "bg-purple-100 text-purple-700"
                              : n.type === "status_change"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {n.type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {fmtDate(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Users ──────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({ status: statusFilter, sort });
    if (search) params.set("search", search);

    (async () => {
      try {
        const res = await fetch(`/api/admin/users?${params}`);
        if (!res.ok) throw new Error("Could not load users");
        const d = await res.json();
        if (ignore) return;
        setUsers(d.users);
        setTotal(d.pagination.total);
        setLoadError(null);
      } catch (e) {
        if (!ignore) {
          setLoadError(e instanceof Error ? e.message : "Could not load users");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [search, statusFilter, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {["all", "ACTIVE", "TRIALING", "PAST_DUE", "CANCELED", "NONE"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                statusFilter === s
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s === "all" ? "All" : s === "NONE" ? "Free" : s}
            </button>
          )
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
        >
          <option value="recent">Newest first</option>
          <option value="active">Recently active</option>
          <option value="name">Email A–Z</option>
        </select>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search users…"
          className="w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-3 text-xs font-semibold text-slate-500">
          {total} user{total === 1 ? "" : "s"}
        </div>
        {loading ? (
          <EmptyState message="Loading…" />
        ) : users.length === 0 ? (
          <EmptyState message="No users match those filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Plan</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Usage</th>
                  <th className="px-6 py-3 font-semibold">Last Active</th>
                  <th className="px-6 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-6 py-3">
                      <div className="font-semibold text-slate-900">
                        {u.email}
                      </div>
                      <div className="text-xs text-slate-500">
                        {[u.name, u.company].filter(Boolean).join(" · ") || "—"}
                        {u.role === "ADMIN" && (
                          <span className="ml-2 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {u.subscriptionStatus ? (
                        <div className="space-y-1">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              STATUS_COLORS[u.subscriptionStatus] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {u.subscriptionStatus}
                          </span>
                          <div className="text-[11px] text-slate-500">
                            {u.subscriptionPlan?.replace("_", " ")}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                        {u.tier}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-600">
                      <span title="Bids">{u._count.bids} bids</span>
                      <span className="text-slate-300"> · </span>
                      <span title="Jobs">{u._count.jobs} jobs</span>
                      <span className="text-slate-300"> · </span>
                      <span title="Clients">{u._count.clients} clients</span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={
                          u.lastActiveAt ? "text-slate-600" : "text-slate-400"
                        }
                      >
                        {timeAgo(u.lastActiveAt)}
                      </span>
                      {u.loginCount > 0 && (
                        <div className="text-[10px] text-slate-400">
                          {u.loginCount} logins
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {timeAgo(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Activity ───────────────────────────────────────────────

function ActivityTab() {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [byType, setByType] = useState<Record<string, number>>({});
  const [daily, setDaily] = useState<{ date: string; count: number }[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({ type: typeFilter, days: String(days) });

    (async () => {
      try {
        const res = await fetch(`/api/admin/activity?${params}`);
        if (!res.ok) throw new Error("Could not load activity");
        const d = await res.json();
        if (ignore) return;
        setActivities(d.activities);
        setByType(d.byType);
        setDaily(d.daily);
        setLoadError(null);
      } catch (e) {
        if (!ignore) {
          setLoadError(
            e instanceof Error ? e.message : "Could not load activity"
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [typeFilter, days]);

  const maxDaily = Math.max(...daily.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <Card
        title={`Activity — last ${days} days`}
        action={
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-orange-500"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        }
      >
        {daily.length === 0 ? (
          <EmptyState message="No activity recorded yet." />
        ) : (
          <div className="flex h-32 items-end gap-[2px]">
            {daily.map((d) => (
              <div
                key={d.date}
                className="group relative flex-1 rounded-t bg-orange-400/60 transition hover:bg-orange-500"
                style={{
                  height: `${Math.max((d.count / maxDaily) * 100, 2)}%`,
                }}
                title={`${d.date}: ${d.count}`}
              />
            ))}
          </div>
        )}
      </Card>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            typeFilter === "all"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          All ({Object.values(byType).reduce((a, b) => a + b, 0)})
        </button>
        {Object.entries(byType)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                typeFilter === type
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {ACTIVITY_LABELS[type] || type} ({count})
            </button>
          ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <EmptyState message="Loading…" />
        ) : activities.length === 0 ? (
          <EmptyState message="Nothing here yet. Activity appears once users start working in the app." />
        ) : (
          <div className="divide-y divide-slate-50">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 px-6 py-3 transition hover:bg-slate-50"
              >
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    ACTIVITY_COLORS[a.type] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {ACTIVITY_LABELS[a.type] || a.type}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-800">
                    {a.user?.email || "Unknown user"}
                  </div>
                  {a.user?.company && (
                    <div className="truncate text-xs text-slate-500">
                      {a.user.company}
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {timeAgo(a.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
