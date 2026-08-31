"use client";

import { useState } from "react";
import Link from "next/link";
import { PLAN_LIST } from "@/lib/plans";

const TRADES = [
  "General Contractor",
  "Electrician",
  "Plumber",
  "HVAC",
  "Roofing",
  "Concrete",
  "Framing",
  "Painting",
  "Landscaping",
  "Other",
];

/* ───── SVG Icon Components ───── */
function IconBid() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}
function IconMargin() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function IconJob() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="12.01"/>
    </svg>
  );
}
function IconCRM() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconEmail() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function IconChange() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16,3 21,3 21,8"/>
      <line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21,16 21,21 16,21"/>
      <line x1="15" y1="15" x2="21" y2="21"/>
      <line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  );
}

const FEATURES = [
  {
    icon: <IconBid />,
    title: "Bid Estimation",
    desc: "Build accurate bids with material, labor, equipment, and sub costs. Auto-calculate overhead, profit margins, and contingency.",
  },
  {
    icon: <IconMargin />,
    title: "Profit Margins",
    desc: "Know your numbers before you commit. See real margins on every job, every line item, every change order.",
  },
  {
    icon: <IconJob />,
    title: "Job Tracking",
    desc: "Track every active job from kickoff to punch list. Daily logs, change orders, crew tracking, and budget vs. actual.",
  },
  {
    icon: <IconCRM />,
    title: "Client CRM",
    desc: "Manage your pipeline from lead to close. Track prospects, send proposals, and never lose a follow-up again.",
  },
  {
    icon: <IconEmail />,
    title: "Email Sequences",
    desc: "Automated outreach to new leads and follow-ups to existing clients. Stay top of mind without lifting a finger.",
    comingSoon: true,
  },
  {
    icon: <IconChange />,
    title: "Change Orders",
    desc: "Log and track every scope change with dollar amounts. Keep clients informed and your margins protected.",
    comingSoon: true,
  },
];

/* ───── Logo Component ───── */
function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const iconSize = size === "small" ? 18 : 22;
  const boxSize = size === "small" ? "w-9 h-9" : "w-10 h-10";
  const textSize = size === "small" ? "text-base" : "text-xl";
  const iqSize = size === "small" ? "text-[10px]" : "text-xs";

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${boxSize} bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20`}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21L12 3L21 21H3Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
          <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="flex items-baseline gap-0">
        <span className={`${textSize} font-black tracking-tight text-slate-900`}>PRO</span>
        <span className={`${textSize} font-black tracking-tight text-orange-500`}>SPEC</span>
        <span className={`${iqSize} font-bold text-slate-400 tracking-widest ml-1`}>IQ</span>
      </div>
    </div>
  );
}

function LogoLight({ size = "default" }: { size?: "default" | "small" }) {
  const iconSize = size === "small" ? 18 : 22;
  const boxSize = size === "small" ? "w-9 h-9" : "w-10 h-10";
  const textSize = size === "small" ? "text-base" : "text-xl";
  const iqSize = size === "small" ? "text-[10px]" : "text-xs";

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${boxSize} bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center`}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21L12 3L21 21H3Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
          <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="flex items-baseline gap-0">
        <span className={`${textSize} font-black tracking-tight text-white`}>PRO</span>
        <span className={`${textSize} font-black tracking-tight text-orange-400`}>SPEC</span>
        <span className={`${iqSize} font-bold text-slate-500 tracking-widest ml-1`}>IQ</span>
      </div>
    </div>
  );
}

/* ───── Dashboard Mockup ───── */
function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-4xl mt-16">
      {/* Glow effect behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-orange-400/10 to-orange-500/20 rounded-3xl blur-2xl"></div>

      {/* Browser chrome */}
      <div className="relative bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/50 overflow-hidden border border-slate-700/50">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-slate-800 rounded-lg px-4 py-1 text-xs text-slate-400 font-mono">prospeciq.com/app</div>
          </div>
        </div>

        {/* App content */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="w-14 bg-slate-800/50 border-r border-slate-700/30 py-4 flex flex-col items-center gap-4">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 21L12 3L21 21H3Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/><line x1="7.5" y1="14" x2="16.5" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            {["📊","📋","🔨","👥","✉️"].map((icon, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${i === 0 ? "bg-orange-500" : "hover:bg-slate-700"}`}>{icon}</div>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-[320px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="h-4 w-28 bg-slate-900 rounded-md"></div>
                <div className="h-3 w-44 bg-slate-300 rounded mt-2"></div>
              </div>
              <div className="h-9 w-28 bg-orange-500 rounded-lg"></div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {/* Neutral by default. Only margin gets tinted, because margin
                  is the only one of these that can be bad — so it's the only
                  one where color carries information rather than decoration. */}
              {[
                { label: "Active Bids", val: "12", sub: "3 due this week" },
                { label: "Jobs", val: "8", sub: "2 in progress" },
                { label: "Pipeline", val: "$553,700", sub: "across 12 bids" },
                { label: "Avg Margin", val: "18.8%", sub: "\u25b2 2.1 vs last month", good: true },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-xl border p-3 ${
                    s.good
                      ? "border-emerald-200 bg-emerald-50/60"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {s.label}
                  </div>
                  <div
                    className={`mt-1 text-xl font-bold tracking-tight tabular-nums ${
                      s.good ? "text-emerald-800" : "text-slate-900"
                    }`}
                  >
                    {s.val}
                  </div>
                  <div
                    className={`mt-0.5 text-[9.5px] font-medium tabular-nums ${
                      s.good ? "text-emerald-700" : "text-slate-400"
                    }`}
                  >
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <span>Project</span><span>Client</span><span>Bid</span><span>Margin</span><span>Status</span>
              </div>
              {[
                { name: "Office Renovation", client: "Apex Dev", bid: "$124,500", margin: "18.2%", marginColor: "text-emerald-700", status: "Submitted", statusColor: "bg-slate-100 text-slate-600" },
                { name: "Retail Build-Out", client: "MG Holdings", bid: "$89,200", margin: "22.4%", marginColor: "text-emerald-700", status: "Accepted", statusColor: "bg-emerald-100 text-emerald-800" },
                { name: "Tenant Improvement", client: "LDR Logistics", bid: "$11,175", margin: "9.4%", marginColor: "text-red-700 font-bold", status: "Draft", statusColor: "bg-slate-100 text-slate-600" },
              ].map((row) => (
                <div key={row.name} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-slate-50 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">{row.name}</span>
                  <span>{row.client}</span>
                  <span className="font-medium tabular-nums">{row.bid}</span>
                  <span className={`font-medium tabular-nums ${row.marginColor}`}>{row.margin}</span>
                  <span><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${row.statusColor}`}>{row.status}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── Main Page ───── */
export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [trade, setTrade] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, trade }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // fail silently
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-3.5 max-w-7xl mx-auto">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
            <a href="#features" className="hover:text-slate-900 transition">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition">Pricing</a>
            <Link href="/trades" className="hover:text-slate-900 transition">Trades</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 transition font-medium">
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(249,115,22,0.03),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            The platform for construction pros
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 leading-[0.95] max-w-5xl mx-auto tracking-tighter">
            Bid Smarter.
            <br />
            {/* Both lines sit in navy so the headline reads as one statement
                rather than two competing ones. Orange survives only on the
                period — which makes the CTA the loudest thing on the page,
                where the click actually is. */}
            <span className="text-slate-900">
              Build Bigger<span className="text-orange-500">.</span>
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal">
            The all-in-one platform for construction companies and trade
            professionals. Estimate bids, track margins, manage clients,
            and grow your business.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-orange-600 transition shadow-xl shadow-orange-500/20 flex items-center gap-2"
            >
              Start Free Trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
            </Link>
            <a
              href="#features"
              className="text-slate-600 px-8 py-4 rounded-xl font-semibold text-base hover:bg-slate-50 transition border border-slate-200 flex items-center gap-2"
            >
              See how it works
            </a>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-slate-400 font-medium tracking-wide">
            NO CREDIT CARD REQUIRED &nbsp;&bull;&nbsp; 7-DAY FREE TRIAL &nbsp;&bull;&nbsp; CANCEL ANYTIME
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <DashboardMockup />
        </div>
      </section>

      {/* ─── Trades covered ─── */}
      <section className="border-y border-slate-100 py-12 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Purpose-built estimating for every trade</p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {[
              { slug: "electrical", label: "ELECTRICAL" },
              { slug: "plumbing", label: "PLUMBING" },
              { slug: "hvac", label: "HVAC" },
              { slug: "concrete", label: "CONCRETE" },
              { slug: "roofing", label: "ROOFING" },
              { slug: "framing", label: "FRAMING" },
            ].map((t) => (
              <Link
                key={t.slug}
                href={`/trades/${t.slug}`}
                className="text-sm md:text-base font-bold text-slate-400 hover:text-orange-500 tracking-tight whitespace-nowrap transition-colors"
              >
                {t.label}
              </Link>
            ))}
            <Link href="/trades" className="text-sm md:text-base font-bold text-orange-500 hover:text-orange-600 tracking-tight whitespace-nowrap transition-colors">
              + 9 MORE
            </Link>
          </div>
        </div>
      </section>

      {/* ─── What the estimator actually does ─── */}
      <section className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.08),transparent_70%)]"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-orange-400/70 uppercase tracking-widest mb-12">Built around how contractors actually price work</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "15", label: "Trades with their own cost inputs" },
              { stat: "4", label: "Markups calculated on every bid" },
              { stat: "0", label: "Per-seat fees, ever" },
              { stat: "7", label: "Day free trial, no card charged" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 tabular-nums">{s.stat}</p>
                <p className="text-sm text-slate-400 mt-3 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-20">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to<br className="hidden md:block" /> win more work
          </h2>
          <p className="text-slate-500 mt-5 max-w-xl mx-auto text-lg">
            From first estimate to final invoice. Pro Spec IQ handles the
            business side so you can focus on the build.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white p-8 hover:bg-orange-50/30 transition-colors duration-300 group">
              <div className="text-orange-500 mb-5 group-hover:text-orange-600 transition-colors">{f.icon}</div>
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                {f.title}
                {"comingSoon" in f && f.comingSoon && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    Soon
                  </span>
                )}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-slate-50 border-y border-slate-100 py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Up and running in minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Create your account", desc: "Pick your tier — General Contractor or Trade — and set up your profile in under 2 minutes." },
              { step: "02", title: "Build your first bid", desc: "Add line items, materials, labor, and overhead. See your margins update in real-time." },
              { step: "03", title: "Win more work", desc: "Track jobs, manage clients, and send automated follow-ups. Grow your business on autopilot." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg mb-6">{item.step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trades We Serve ─── */}
      <section id="trades" className="py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Built for the field</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Every trade. Every crew size.
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-14 text-lg">
            Whether you&apos;re a one-truck operation or running a 50-person crew,
            Pro Spec IQ scales with your business.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {[
              { label: "General Contractors", slug: "general" },
              { label: "Electricians", slug: "electrical" },
              { label: "Plumbers", slug: "plumbing" },
              { label: "HVAC Technicians", slug: "hvac" },
              { label: "Roofers", slug: "roofing" },
              { label: "Concrete Contractors", slug: "concrete" },
              { label: "Framers", slug: "framing" },
              { label: "Painters", slug: "painting" },
              { label: "Landscapers", slug: "landscaping" },
              { label: "Excavation", slug: "excavation" },
              { label: "Drywall", slug: "drywall" },
              { label: "Flooring", slug: "flooring" },
              { label: "Masonry", slug: "masonry" },
              { label: "Welding", slug: "welding" },
              { label: "Demolition", slug: "demolition" },
              { label: "Insulation", slug: "insulation" },
            ].map((t) => (
              <Link
                key={t.slug}
                href={`/trades/${t.slug}`}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:border-orange-400 hover:text-orange-600 transition-all"
              >
                {t.label}
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/trades" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition">
              See how estimating works for each trade →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="bg-slate-900 py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.1),transparent_60%)]"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Simple, honest pricing</h2>
            <p className="text-slate-400 mt-4 text-lg">No per-seat fees. No hidden costs. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLAN_LIST.map((plan) => (
              <div
                key={plan.key}
                className={`rounded-2xl p-8 transition-all duration-300 relative ${
                  plan.badge === "Most Popular"
                    ? "bg-white text-slate-900 shadow-2xl shadow-orange-500/10 ring-2 ring-orange-500 scale-[1.02]"
                    : "bg-slate-800/50 text-white border border-slate-700/50 hover:border-slate-600"
                }`}
              >
                {plan.badge === "Most Popular" && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-bold bg-orange-500 text-white px-5 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/30">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className={`text-lg font-bold ${plan.badge === "Most Popular" ? "text-slate-900 mt-2" : "text-white"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.badge === "Most Popular" ? "text-slate-500" : "text-slate-400"}`}>
                  {plan.description}
                </p>
                <div className="mt-6 mb-8">
                  <span className={`text-5xl font-extrabold ${plan.badge === "Most Popular" ? "text-slate-900" : "text-white"}`}>{`$${plan.price}`}</span>
                  <span className={`text-sm ${plan.badge === "Most Popular" ? "text-slate-500" : "text-slate-500"}`}>
                    {"/mo"}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.label} className={`text-sm flex items-center gap-3 ${plan.badge === "Most Popular" ? "text-slate-600" : "text-slate-300"} ${f.comingSoon ? "opacity-60" : ""}`}>
                      <span className={f.comingSoon ? "text-slate-400 flex-shrink-0" : "text-orange-500 flex-shrink-0"}><IconCheck /></span>
                      <span>
                        {f.label}
                        {f.comingSoon && (
                          <span className="ml-2 rounded bg-slate-700/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-300">
                            Soon
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full text-center py-3.5 rounded-xl font-bold transition text-sm ${
                    plan.badge === "Most Popular"
                      ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                      : "bg-white/10 text-white hover:bg-white/20 border border-slate-600"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Waitlist / CTA ─── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.05),transparent_70%)]"></div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Stop leaving money<br />on the table</h2>
          <p className="text-slate-500 mt-6 text-lg">
            Get on the list for early access. We&apos;re onboarding founding contractors now, and early accounts help shape what gets built next.
          </p>

          <div className="mt-10 max-w-md mx-auto">
            {submitted ? (
              <div className="bg-green-50 text-green-700 rounded-2xl p-8 text-center border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20,6 9,17 4,12"/></svg>
                </div>
                <p className="font-bold text-lg">You&apos;re on the list!</p>
                <p className="text-sm mt-1 text-green-600">We&apos;ll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 bg-white placeholder:text-slate-400 text-base shadow-sm"
                />
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-600 bg-white text-base shadow-sm"
                >
                  <option value="">Select your trade (optional)</option>
                  {TRADES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl hover:bg-slate-800 transition font-bold disabled:opacity-50 text-base"
                >
                  {loading ? "Joining..." : "Join the Waitlist"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div>
              <LogoLight size="small" />
              <p className="text-slate-500 text-sm mt-4 max-w-xs leading-relaxed">
                The all-in-one bidding, estimating, and CRM platform built for construction professionals.
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product</p>
                <div className="flex flex-col gap-3">
                  <a href="#features" className="text-sm text-slate-500 hover:text-white transition">Features</a>
                  <a href="#pricing" className="text-sm text-slate-500 hover:text-white transition">Pricing</a>
                  <Link href="/trades" className="text-sm text-slate-500 hover:text-white transition">Trades</Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Company</p>
                <div className="flex flex-col gap-3">
                  <Link href="/terms" className="text-sm text-slate-500 hover:text-white transition">Terms</Link>
                  <Link href="/privacy" className="text-sm text-slate-500 hover:text-white transition">Privacy</Link>
                  <a href="mailto:nathan@prospeciq.com" className="text-sm text-slate-500 hover:text-white transition">Contact</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">&copy; {new Date().getFullYear()} Pro Spec IQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
