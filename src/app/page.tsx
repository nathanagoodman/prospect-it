"use client";

import { useState } from "react";
import Link from "next/link";

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

const FEATURES = [
  {
    icon: "📐",
    title: "Bid Estimation",
    desc: "Build accurate bids with material, labor, equipment, and sub costs. Auto-calculate overhead, profit margins, and contingency.",
  },
  {
    icon: "📊",
    title: "Profit Margin Calculator",
    desc: "Know your numbers before you commit. See real margins on every job, every line item, every change order.",
  },
  {
    icon: "👷",
    title: "Job Tracking",
    desc: "Track every active job from kickoff to punch list. Daily logs, change orders, crew tracking, and budget vs. actual.",
  },
  {
    icon: "🤝",
    title: "Client CRM",
    desc: "Manage your pipeline from lead to close. Track prospects, send proposals, and never lose a follow-up again.",
  },
  {
    icon: "✉️",
    title: "Email Sequences",
    desc: "Automated outreach to new leads and follow-ups to existing clients. Stay top of mind without lifting a finger.",
  },
  {
    icon: "📋",
    title: "Change Orders",
    desc: "Log and track every scope change with dollar amounts. Keep clients informed and your margins protected.",
  },
];

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
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21L12 3L21 21H3Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
              <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black tracking-tight text-slate-900">PRO</span>
            <span className="text-xl font-black tracking-tight text-orange-500">SPEC</span>
            <span className="text-sm font-bold text-slate-400 tracking-wider ml-0.5">IQ</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-600 font-medium">
          <a href="#features" className="hover:text-slate-900 transition">Features</a>
          <a href="#pricing" className="hover:text-slate-900 transition">Pricing</a>
          <a href="#trades" className="hover:text-slate-900 transition">Trades</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition font-medium">
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition font-semibold shadow-sm shadow-orange-500/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-28 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-semibold px-5 py-2 rounded-full mb-8 border border-orange-100">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          Built for contractors &amp; trades
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] max-w-4xl mx-auto tracking-tight">
          Bid Smarter.{" "}
          <span className="text-orange-500">Build Bigger.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          The all-in-one platform for construction companies and trade
          professionals to estimate bids, track profit margins, manage clients,
          and grow their business.
        </p>

        {/* Waitlist Form */}
        <div className="mt-12 max-w-md mx-auto">
          {submitted ? (
            <div className="bg-green-50 text-green-700 rounded-xl p-6 text-center border border-green-200">
              <p className="font-bold text-lg">You&apos;re on the list!</p>
              <p className="text-sm mt-1">We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 bg-slate-50 placeholder:text-slate-400"
              />
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-600 bg-slate-50"
              >
                <option value="">Select your trade (optional)</option>
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3.5 rounded-xl hover:bg-orange-600 transition font-bold disabled:opacity-50 shadow-lg shadow-orange-500/25 text-base"
              >
                {loading ? "Joining..." : "Join the Waitlist"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: "15%", label: "Avg. margin improvement" },
            { stat: "3hrs", label: "Saved per bid" },
            { stat: "2x", label: "More bids submitted" },
            { stat: "98%", label: "Bid accuracy rate" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl md:text-5xl font-black text-orange-500">{s.stat}</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Everything you need to win more work
          </h2>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg">
            From first estimate to final invoice — Pro Spec IQ handles the
            business side so you can focus on the build.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-slate-200 rounded-2xl p-7 hover:shadow-xl hover:border-orange-200 transition-all duration-300 group bg-white">
              <div className="text-3xl mb-4 w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">{f.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trades We Serve */}
      <section id="trades" className="bg-slate-50 py-28 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Built for every trade
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-12 text-lg">
            Whether you&apos;re a one-truck operation or running a 50-person crew,
            Pro Spec IQ scales with your business.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "General Contractors", "Electricians", "Plumbers", "HVAC Technicians",
              "Roofers", "Concrete Contractors", "Framers", "Painters",
              "Landscapers", "Excavation", "Drywall", "Flooring", "Masonry",
              "Welding", "Demolition",
            ].map((t) => (
              <span key={t} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-default">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Simple, honest pricing</h2>
          <p className="text-slate-500 mt-4 text-lg">No per-seat fees. No hidden costs. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: "Starter", price: "$49", period: "/mo",
              desc: "For solo contractors getting organized",
              popular: false,
              features: ["Unlimited bids", "Profit margin calculator", "Up to 50 clients", "Basic job tracking", "Email support"],
            },
            {
              name: "Pro", price: "$99", period: "/mo",
              desc: "For growing companies winning more work",
              popular: true,
              features: ["Everything in Starter", "Unlimited clients", "Email sequences", "Change order tracking", "Daily job logs", "CSV import/export", "Priority support"],
            },
            {
              name: "Enterprise", price: "$249", period: "/mo",
              desc: "For established firms scaling operations",
              popular: false,
              features: ["Everything in Pro", "Multi-user access", "Custom branding", "API access", "Dedicated account manager", "Custom integrations"],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-slate-900 text-white ring-2 ring-orange-500 scale-105 shadow-2xl"
                  : "bg-white border border-slate-200 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <span className="text-xs font-bold bg-orange-500 text-white px-4 py-1.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <h3 className={`text-xl font-bold mt-4 ${plan.popular ? "text-white" : "text-slate-900"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mt-1 ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>
                {plan.desc}
              </p>
              <div className="mt-6">
                <span className="text-5xl font-black">{plan.price}</span>
                <span className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className={`text-sm flex items-start gap-2.5 ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                    <span className="text-orange-500 mt-0.5 font-bold">&#10003;</span>{f}
                  </li>
                ))}
              </ul>
              <button className={`w-full mt-8 py-3.5 rounded-xl font-bold transition ${
                plan.popular
                  ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Stop leaving money on the table</h2>
          <p className="text-orange-100 mt-6 text-lg">
            Join hundreds of contractors who are bidding smarter, tracking margins, and growing their businesses with Pro Spec IQ.
          </p>
          <Link href="/register" className="inline-block mt-10 bg-white text-orange-600 px-10 py-4 rounded-xl font-bold hover:bg-orange-50 transition shadow-lg text-lg">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21L12 3L21 21H3Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-white">PRO</span>
              <span className="text-base font-black text-orange-500">SPEC</span>
              <span className="text-xs font-bold text-slate-500 ml-0.5">IQ</span>
            </div>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <a href="mailto:nathan@prospeciq.com" className="hover:text-white transition">Contact</a>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Pro Spec IQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
