import type { Metadata } from "next";
import Link from "next/link";
import MarkupCalculator from "./calculator";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://www.prospeciq.com"
).replace(/\/$/, "");

export const dynamic = "force-static";

const TITLE = "Markup vs Margin Calculator for Contractors";
const DESCRIPTION =
  "Free calculator that converts between markup and margin, and shows what to charge to hit a target profit. No signup. Built for contractors.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tools/markup-vs-margin" },
  openGraph: {
    title: `${TITLE} — Pro Spec IQ`,
    description: DESCRIPTION,
    url: `${SITE_URL}/tools/markup-vs-margin`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "What is the difference between markup and margin?",
    a: "Markup is calculated on your cost. Margin is calculated on your selling price. If a job costs you $1,000 and you sell it for $1,200, that is 20% markup but only 16.7% margin. The dollar amount is identical — the two numbers describe the same $200 measured against different bases.",
  },
  {
    q: "Why do contractors lose money confusing markup and margin?",
    a: "Because applying a markup percentage when you meant margin always undercharges. A contractor who needs a 30% margin but adds 30% markup collects about 23% margin instead — roughly a quarter less profit than intended on every job. Repeated across a year of bids, that gap is the difference between a healthy year and a break-even one.",
  },
  {
    q: "What markup do I need for a 30% margin?",
    a: "About 42.9%. The formula is markup = margin ÷ (1 − margin). For 20% margin you need 25% markup; for 40% margin you need 66.7% markup. The gap widens quickly as the target margin rises, which is why the mistake gets more expensive on higher-margin work.",
  },
  {
    q: "Should overhead be included in cost before applying markup?",
    a: "Most contractors apply overhead to the job cost first, then add profit on top of that total. Treating overhead as if it were profit is a common way to end up working for free — overhead is a cost you have already incurred, not earnings.",
  },
];

export default function MarkupVsMarginPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/tools/markup-vs-margin#faq`,
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: TITLE,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DESCRIPTION,
    url: `${SITE_URL}/tools/markup-vs-margin`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />

      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-extralight tracking-tight text-slate-900">PRO SPEC</span>
            <span className="text-lg font-black tracking-tight text-orange-500">IQ</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/trades" className="hover:text-slate-900">Trades</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/register" className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-600">Markup vs Margin Calculator</span>
          </nav>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Markup vs Margin Calculator
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Mixing these up is one of the most expensive arithmetic errors in
            contracting, and it&apos;s easy to make. Put your numbers in below —
            no signup, nothing to install.
          </p>
        </div>
      </section>

      <MarkupCalculator />

      {/* Explanation */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Why this trips people up
        </h2>
        <p className="mt-4 leading-relaxed text-slate-600">
          Markup and margin describe the same dollars measured against different
          bases. Markup is a percentage <em>of your cost</em>. Margin is a
          percentage <em>of your price</em>. Because price is always larger than
          cost, the margin number is always smaller than the markup number for
          the same job.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-[10px] uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3 font-semibold">If you want this margin</th>
                <th className="px-5 py-3 font-semibold">You need this markup</th>
                <th className="px-5 py-3 font-semibold">On $10,000 cost, you charge</th>
              </tr>
            </thead>
            <tbody>
              {[10, 15, 20, 25, 30, 35, 40, 50].map((m) => {
                const markup = (m / (100 - m)) * 100;
                const price = 10000 / (1 - m / 100);
                return (
                  <tr key={m} className="border-t border-slate-100">
                    <td className="px-5 py-2.5 font-medium text-slate-800">{m}%</td>
                    <td className="px-5 py-2.5 text-slate-700">{markup.toFixed(1)}%</td>
                    <td className="px-5 py-2.5 text-slate-700">
                      ${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-bold text-amber-900">The costly version of this mistake</h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-900">
            A contractor who needs 30% margin but adds 30% <em>markup</em> collects
            about 23% margin instead. On $500,000 of annual cost, that&apos;s roughly
            $64,000 of profit that never shows up — without a single thing going
            wrong on any job.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-black tracking-tight text-slate-900">
          Common questions
        </h2>
        <div className="mt-6 space-y-4">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-slate-200 p-5 open:bg-slate-50/50"
            >
              <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <span className="shrink-0 text-orange-500 transition group-open:rotate-45" aria-hidden="true">+</span>
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Soft CTA */}
      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            This is one number out of a whole bid
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-600">
            Pro Spec IQ applies overhead, profit, and contingency across your
            material, labor, and equipment automatically — with trade-specific
            inputs and a proposal you can send straight to the customer.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-orange-500 px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Start a 7-day free trial
            </Link>
            <Link
              href="/trades"
              className="rounded-lg border border-slate-200 bg-white px-7 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              See it for your trade
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} Pro Spec IQ</span>
          <nav className="flex gap-6">
            <Link href="/trades" className="hover:text-slate-900">Trades</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
