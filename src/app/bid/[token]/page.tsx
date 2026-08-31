"use client";

import { use, useEffect, useState } from "react";

interface ClientLine {
  description: string;
  amount: number;
}

interface Proposal {
  jobName: string;
  description: string | null;
  tradeType: string;
  dueDate: string | null;
  createdAt: string;
  total: number;
  lineItems: ClientLine[];
  client: { name: string; company: string | null } | null;
  contractor: {
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    licenseNumber: string | null;
    logoBase64: string | null;
    accentColor: string;
  };
  paymentTerms: string | null;
  footerText: string | null;
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

export default function PublicBidPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    const preview =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("preview") === "1";

    // Encode: an unencoded token allows relative-path traversal to another
    // same-origin endpoint via a crafted link.
    fetch(
      `/api/public/bid/${encodeURIComponent(token)}${preview ? "?preview=1" : ""}`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setProposal(d);
        setState("ready");
      })
      .catch(() => setState("missing"));
  }, [token]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading proposal…</p>
      </div>
    );
  }

  if (state === "missing" || !proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            This proposal isn&apos;t available
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The link may have expired or been withdrawn. Please contact the
            contractor who sent it to you for an up-to-date copy.
          </p>
        </div>
      </div>
    );
  }

  const c = proposal.contractor;
  const accent = c.accentColor || "#f97316";
  const cityLine = [c.city, c.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
        {/* Action bar — hidden when printing */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <p className="text-sm text-slate-500">
            Proposal from {c.name || "your contractor"}
          </p>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Print / Save PDF
          </button>
        </div>

        <article className="rounded-2xl bg-white p-8 shadow-sm print:rounded-none print:shadow-none md:p-12">
          {/* Letterhead */}
          <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 pb-8" style={{ borderColor: accent }}>
            <div>
              {c.logoBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logoBase64} alt={c.name} className="mb-3 max-h-16" />
              ) : (
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  {c.name}
                </h2>
              )}
              <div className="mt-2 space-y-0.5 text-sm text-slate-600">
                {c.address && <p>{c.address}</p>}
                {(cityLine || c.zip) && <p>{[cityLine, c.zip].filter(Boolean).join(" ")}</p>}
                {c.phone && <p>{c.phone}</p>}
                {c.email && <p>{c.email}</p>}
                {c.website && <p>{c.website}</p>}
                {c.licenseNumber && (
                  <p className="pt-1 text-xs text-slate-500">
                    License #{c.licenseNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accent }}
              >
                Proposal
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {fmtDate(proposal.createdAt)}
              </p>
              {proposal.dueDate && (
                <p className="mt-2 text-sm text-slate-500">
                  Valid until{" "}
                  <span className="font-semibold text-slate-700">
                    {fmtDate(proposal.dueDate)}
                  </span>
                </p>
              )}
            </div>
          </header>

          {/* Prepared for */}
          {proposal.client && (
            <section className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Prepared for
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {proposal.client.company || proposal.client.name}
              </p>
              {proposal.client.company && (
                <p className="text-sm text-slate-600">{proposal.client.name}</p>
              )}
            </section>
          )}

          {/* Scope */}
          <section className="mt-8">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {proposal.jobName}
            </h1>
            {proposal.description && (
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
                {proposal.description}
              </p>
            )}
          </section>

          {/* Pricing */}
          <section className="mt-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-widest text-slate-400">
                  <th className="pb-2 font-semibold">Description</th>
                  <th className="pb-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {proposal.lineItems.map((li, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 text-slate-700">{li.description}</td>
                    <td className="py-3 text-right font-medium text-slate-900">
                      {money(li.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-5 text-right font-bold text-slate-900">
                    Total
                  </td>
                  <td className="pt-5 text-right">
                    <span
                      className="text-2xl font-black"
                      style={{ color: accent }}
                    >
                      {money(proposal.total)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {proposal.paymentTerms && (
            <section className="mt-10 rounded-xl bg-slate-50 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Terms
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {proposal.paymentTerms}
              </p>
            </section>
          )}

          <footer className="mt-10 border-t border-slate-100 pt-6 text-center text-xs leading-relaxed text-slate-400">
            {proposal.footerText ? (
              <p className="whitespace-pre-line">{proposal.footerText}</p>
            ) : (
              <p>
                Thank you for the opportunity to bid on this work. Please reach
                out with any questions.
              </p>
            )}
          </footer>
        </article>

        <p className="mt-6 text-center text-xs text-slate-400 print:hidden">
          Sent with Pro Spec IQ
        </p>
      </div>
    </div>
  );
}
