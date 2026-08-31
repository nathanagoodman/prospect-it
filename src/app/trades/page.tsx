import type { Metadata } from "next";
import Link from "next/link";
import { TRADE_SLUGS, TRADE_CONTENT } from "@/lib/trade-content";
import { TRADE_CONFIGS } from "@/lib/trades";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://www.prospeciq.com"
).replace(/\/$/, "");

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Estimating Software by Trade",
  description:
    "Bidding and estimating software with cost inputs built for each trade — electrical, plumbing, HVAC, concrete, roofing, framing, and more.",
  alternates: { canonical: "/trades" },
  openGraph: {
    title: "Estimating Software by Trade — Pro Spec IQ",
    description:
      "Bidding and estimating software with cost inputs built for each trade — electrical, plumbing, HVAC, concrete, roofing, framing, and more.",
    url: `${SITE_URL}/trades`,
    type: "website",
  },
};

export default function TradesIndexPage() {
  // Show general contractor first, then the trades alphabetically.
  const ordered = [
    ...TRADE_SLUGS.filter((s) => s === "general"),
    ...TRADE_SLUGS.filter((s) => s !== "general").sort((a, b) =>
      TRADE_CONFIGS[a].label.localeCompare(TRADE_CONFIGS[b].label)
    ),
  ];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Estimating software by trade",
    itemListElement: ordered.map((slug, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: TRADE_CONFIGS[slug].label,
      url: `${SITE_URL}/trades/${slug}`,
    })),
  };

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-extralight tracking-tight text-slate-900">PRO SPEC</span>
            <span className="text-lg font-black tracking-tight text-orange-500">IQ</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/login" className="hover:text-slate-900">Log in</Link>
            <Link href="/register" className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-600">Trades</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Estimating software built for your trade
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            A generic cost box doesn&apos;t reflect how any trade actually prices work.
            Electricians estimate in circuits, roofers in squares, concrete crews in
            cubic yards. Pro Spec IQ gives each trade its own inputs, its own starting
            markups, and one place to track the job after the bid is won.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((slug) => {
            const config = TRADE_CONFIGS[slug];
            const content = TRADE_CONTENT[slug];
            if (!content) return null;

            return (
              <Link
                key={slug}
                href={`/trades/${slug}`}
                className="group rounded-2xl border border-slate-200 p-6 transition hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/5"
              >
                <div className="mb-3 text-3xl" aria-hidden="true">{config.icon}</div>
                <h2 className="font-bold text-slate-900 group-hover:text-orange-600">
                  {config.label}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {content.metaDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {config.specificMetrics.slice(0, 3).map((m) => (
                    <span
                      key={m.key}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Don&apos;t see your trade?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-600">
            Every account can bid with standard material, labor, equipment, and
            markup inputs, whether or not the trade has its own preset. General
            contractor accounts can combine multiple trades on one project.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-orange-500 px-8 py-3.5 font-semibold text-white transition hover:bg-orange-600"
          >
            Start a 7-day free trial
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} Pro Spec IQ</span>
          <nav className="flex gap-6">
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
