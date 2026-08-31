"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTradeConfig, getTradeSpecificMetrics } from "@/lib/trades";
import { toClientLineItems } from "@/lib/bid-calc";

interface LineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Bid {
  id: string;
  jobName: string;
  description: string | null;
  tradeType: string;
  tradeMetrics: Record<string, number | string> | null;
  materialCost: number;
  laborCost: number;
  laborHours: number;
  laborRate: number;
  equipmentCost: number;
  subcontractorCost: number;
  permitCost: number;
  overheadPercent: number;
  profitPercent: number;
  contingencyPercent: number;
  subtotal: number;
  overhead: number;
  profit: number;
  contingency: number;
  totalBid: number;
  profitMargin: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
  shareToken: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  lineItems: LineItem[];
  client: { id: string; name: string; company: string | null } | null;
}

const STATUSES = ["DRAFT", "READY", "SUBMITTED", "ACCEPTED", "REJECTED", "EXPIRED"];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  READY: "bg-blue-100 text-blue-700",
  SUBMITTED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-amber-100 text-amber-700",
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function BidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/bids/${id}`);
      if (res.status === 404) throw new Error("This bid no longer exists.");
      if (!res.ok) throw new Error("Could not load this bid.");
      setBid(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (status: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/bids/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Could not update the status.");
    } finally {
      setBusy(false);
    }
  };

  const createShareLink = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/bids/${id}/share`, { method: "POST" });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Could not create a share link.");
    } finally {
      setBusy(false);
    }
  };

  const revokeShareLink = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/bids/${id}/share`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Could not revoke the link.");
    } finally {
      setBusy(false);
    }
  };

  const shareUrl = bid?.shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/bid/${bid.shareToken}`
    : null;

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy — select the link and copy manually.");
    }
  };

  const downloadPdf = async () => {
    if (!bid) return;
    setBusy(true);
    try {
      const [{ default: jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = autoTableMod.default;

      // Same converter the public page uses, so the PDF can never show
      // margin even if this page is edited later.
      const lines = toClientLineItems(bid);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("PROPOSAL", 14, 22);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(bid.jobName, 14, 32);

      doc.setFontSize(9);
      doc.setTextColor(120);
      let y = 39;
      if (bid.client) {
        doc.text(`Prepared for: ${bid.client.company || bid.client.name}`, 14, y);
        y += 5;
      }
      doc.text(`Date: ${fmtDate(bid.createdAt)}`, 14, y);
      if (bid.dueDate) {
        y += 5;
        doc.text(`Valid until: ${fmtDate(bid.dueDate)}`, 14, y);
      }

      if (bid.description) {
        y += 8;
        doc.setTextColor(60);
        const wrapped = doc.splitTextToSize(bid.description, pageWidth - 28);
        doc.text(wrapped, 14, y);
        y += wrapped.length * 4;
      }

      autoTable(doc, {
        startY: y + 6,
        head: [["Description", "Amount"]],
        body: lines.map((l) => [l.description, money(l.amount)]),
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        columnStyles: { 1: { halign: "right", cellWidth: 40 } },
        margin: { left: 14, right: 14 },
      });

      // Draw the total below the table (this autotable version has no
      // `foot` option), matching how the invoice PDF does it.
      const finalY =
        (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
          ?.finalY ?? y + 40;

      doc.setFillColor(249, 115, 22);
      doc.rect(pageWidth - 94, finalY + 6, 80, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("TOTAL", pageWidth - 90, finalY + 14);
      doc.text(money(bid.totalBid), pageWidth - 18, finalY + 14, { align: "right" });

      doc.save(`${bid.jobName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-proposal.pdf`);
    } catch (e) {
      console.error(e);
      setError("Could not generate the PDF.");
    } finally {
      setBusy(false);
    }
  };

  const deleteBid = async () => {
    if (!confirm("Delete this bid? This can't be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/bids/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/app/bids");
    } catch {
      setError("Could not delete this bid.");
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-400">Loading bid…</p>
      </div>
    );
  }

  if (error && !bid) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
        <Link
          href="/app/bids"
          className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:underline"
        >
          ← Back to bids
        </Link>
      </div>
    );
  }

  if (!bid) return null;

  const config = getTradeConfig(bid.tradeType);
  const metricDefs = getTradeSpecificMetrics(bid.tradeType);
  const enteredMetrics = metricDefs.filter(
    (m) => Number(bid.tradeMetrics?.[m.key] ?? 0) > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/app/bids"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Bids
        </Link>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{config.icon}</span>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {bid.jobName}
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {config.label} · Created {fmtDate(bid.createdAt)}
              {bid.client && ` · ${bid.client.company || bid.client.name}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-900">
              {money(bid.totalBid)}
            </p>
            <p className="text-sm text-slate-500">
              {bid.profitMargin.toFixed(1)}% margin
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Status
          </span>
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={busy}
              onClick={() => updateStatus(s)}
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition disabled:opacity-50 ${
                bid.status === s
                  ? STATUS_COLORS[s]
                  : "bg-white text-slate-500 hover:bg-slate-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Share */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900">Send to your customer</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Creates a link showing the scope and the total price. Your
                overhead, profit, and margin are never included.
              </p>
            </div>
            {!bid.shareToken ? (
              <button
                onClick={createShareLink}
                disabled={busy}
                className="shrink-0 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                Create share link
              </button>
            ) : (
              <button
                onClick={revokeShareLink}
                disabled={busy}
                className="shrink-0 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Revoke link
              </button>
            )}
          </div>

          {shareUrl && (
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
                />
                <button
                  onClick={copyLink}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
                <a
                  href={`${shareUrl}?preview=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Preview
                </a>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {bid.viewCount > 0 ? (
                  <>
                    Viewed {bid.viewCount} time{bid.viewCount === 1 ? "" : "s"}
                    {bid.lastViewedAt && ` · last ${fmtDate(bid.lastViewedAt)}`}
                  </>
                ) : (
                  "Not viewed yet."
                )}
              </p>
            </div>
          )}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Cost breakdown — internal only */}
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Cost breakdown
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                {[
                  ["Material", bid.materialCost],
                  [
                    bid.laborHours > 0
                      ? `Labor (${bid.laborHours} hrs @ ${money(bid.laborRate)})`
                      : "Labor",
                    bid.laborCost,
                  ],
                  ["Equipment", bid.equipmentCost],
                  ["Subcontractor", bid.subcontractorCost],
                  ["Permits", bid.permitCost],
                ]
                  .filter(([, v]) => (v as number) > 0)
                  .map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between">
                      <dt className="text-slate-600">{label}</dt>
                      <dd className="font-medium text-slate-900">
                        {money(value as number)}
                      </dd>
                    </div>
                  ))}

                {bid.lineItems.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-600">
                      Line items ({bid.lineItems.length})
                    </dt>
                    <dd className="font-medium text-slate-900">
                      {money(bid.lineItems.reduce((s, li) => s + li.total, 0))}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <dt className="font-semibold text-slate-700">Subtotal</dt>
                  <dd className="font-bold text-slate-900">{money(bid.subtotal)}</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-slate-600">
                    Overhead ({bid.overheadPercent}%)
                  </dt>
                  <dd className="text-slate-900">{money(bid.overhead)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Profit ({bid.profitPercent}%)</dt>
                  <dd className="text-slate-900">{money(bid.profit)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">
                    Contingency ({bid.contingencyPercent}%)
                  </dt>
                  <dd className="text-slate-900">{money(bid.contingency)}</dd>
                </div>

                <div className="flex justify-between border-t-2 border-slate-900 pt-3">
                  <dt className="font-black text-slate-900">Total bid</dt>
                  <dd className="text-xl font-black text-orange-600">
                    {money(bid.totalBid)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                This breakdown is for you only. The customer-facing link and PDF
                show the scope and total without your markup.
              </p>
            </section>

            {bid.lineItems.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                  Line items
                </h2>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-widest text-slate-400">
                      <th className="pb-2 font-semibold">Description</th>
                      <th className="pb-2 font-semibold">Qty</th>
                      <th className="pb-2 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bid.lineItems.map((li) => (
                      <tr key={li.id} className="border-b border-slate-50">
                        <td className="py-2">
                          <div className="text-slate-800">{li.description}</div>
                          {li.category && (
                            <div className="text-xs text-slate-400">{li.category}</div>
                          )}
                        </td>
                        <td className="py-2 text-slate-600">
                          {li.quantity} × {money(li.unitPrice)}
                        </td>
                        <td className="py-2 text-right font-medium text-slate-900">
                          {money(li.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {enteredMetrics.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                  Takeoff
                </h2>
                <dl className="mt-4 space-y-2 text-sm">
                  {enteredMetrics.map((m) => (
                    <div key={m.key} className="flex justify-between gap-3">
                      <dt className="text-slate-600">{m.label}</dt>
                      <dd className="shrink-0 font-medium text-slate-900">
                        {String(bid.tradeMetrics?.[m.key])} {m.unit}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Actions
              </h2>
              <div className="mt-4 space-y-2">
                <button
                  onClick={downloadPdf}
                  disabled={busy}
                  className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  Download proposal PDF
                </button>
                <Link
                  href={`/app/invoices/new?bidId=${bid.id}`}
                  className="block rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Create invoice
                </Link>
                <button
                  onClick={deleteBid}
                  disabled={busy}
                  className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Delete bid
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
