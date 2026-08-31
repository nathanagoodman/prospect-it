import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTradeContent, TRADE_SLUGS } from "@/lib/trade-content";
import { TRADE_CONFIGS } from "@/lib/trades";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://www.prospeciq.com"
).replace(/\/$/, "");

// Fully static — these pages have no per-request data.
export const dynamic = "force-static";

export function generateStaticParams() {
  return TRADE_SLUGS.map((trade) => ({ trade }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trade: string }>;
}): Promise<Metadata> {
  const { trade } = await params;
  const content = getTradeContent(trade);
  if (!content) return { title: "Trade not found" };

  return {
    title: content.headline,
    description: content.metaDescription,
    alternates: { canonical: `/trades/${content.slug}` },
    openGraph: {
      title: `${content.headline} — Pro Spec IQ`,
      description: content.metaDescription,
      url: `${SITE_URL}/trades/${content.slug}`,
      type: "article",
    },
  };
}

export default async function TradePage({
  params,
}: {
  params: Promise<{ trade: string }>;
}) {
  const { trade } = await params;
  const content = getTradeContent(trade);
  if (!content) notFound();

  const config = TRADE_CONFIGS[content.slug];

  // Per-page FAQ schema. The homepage carries site-level schema; this adds
  // the trade-specific questions so they can be surfaced independently.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/trades/${content.slug}#faq`,
    mainEntity: content.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Trades", item: `${SITE_URL}/trades` },
      {
        "@type": "ListItem",
        position: 3,
        name: config.label,
        item: `${SITE_URL}/trades/${content.slug}`,
      },
    ],
  };

  const others = TRADE_SLUGS.filter((s) => s !== content.slug).slice(0, 8);

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
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

      {/* Hero */}
      <section className="border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/trades" className="hover:text-orange-500">Trades</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-600">{config.label}</span>
          </nav>

          <div className="mb-4 text-4xl" aria-hidden="true">{config.icon}</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {content.headline}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">{content.intro}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Start a 7-day free trial
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* What the estimator tracks */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          What Pro Spec IQ tracks on a {config.label.toLowerCase()} bid
        </h2>
        <p className="mt-3 text-slate-600">
          Beyond material, labor, and equipment, {config.label.toLowerCase()} bids get
          inputs specific to the trade:
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {config.specificMetrics.map((m) => (
            <div key={m.key} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{m.label}</h3>
                <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {m.unit}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{m.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-slate-900 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-orange-400/80">
            Starting markups for {config.label.toLowerCase()}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {[
              { v: config.defaultOverhead, l: "Overhead" },
              { v: config.defaultProfit, l: "Profit" },
              { v: config.defaultContingency, l: "Contingency" },
            ].map((x) => (
              <div key={x.l}>
                <p className="text-3xl font-extrabold text-white">{x.v}%</p>
                <p className="mt-1 text-xs font-medium text-slate-400">{x.l}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
            These are editable defaults, not fixed rates. Set them per bid to match
            your own cost structure and the risk on the job.
          </p>
        </div>
      </section>

      {/* Cost drivers */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            What drives cost on {config.label.toLowerCase()} work
          </h2>
          <ul className="mt-6 space-y-3">
            {content.costDrivers.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                <span className="leading-relaxed text-slate-700">{d}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-900">
            Where these estimates go wrong
          </h2>
          <ul className="mt-6 space-y-3">
            {content.pitfalls.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-1.5 shrink-0 text-orange-500" aria-hidden="true">→</span>
                <span className="leading-relaxed text-slate-700">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {config.label} estimating questions
        </h2>
        <div className="mt-6 space-y-4">
          {content.faqs.map((f) => (
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

      {/* Other trades — internal linking */}
      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Other trades
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map((slug) => (
              <Link
                key={slug}
                href={`/trades/${slug}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-orange-500 hover:text-orange-600"
              >
                {TRADE_CONFIGS[slug].label}
              </Link>
            ))}
            <Link
              href="/trades"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              All trades
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          Build your next {config.label.toLowerCase()} bid in Pro Spec IQ
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-600">
          Seven-day free trial. No charge until the trial ends, and no per-seat fees.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-lg bg-orange-500 px-8 py-3.5 font-semibold text-white transition hover:bg-orange-600"
        >
          Get started
        </Link>
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
