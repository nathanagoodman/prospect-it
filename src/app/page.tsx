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
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-slate-900">
            Prospect <span className="text-orange-500">IT</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition">Features</a>
          <a href="#pricing" className="hover:text-slate-900 transition">Pricing</a>
          <a href="#trades" className="hover:text-slate-900 transition">Trades</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition">
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-block bg-orange-50 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Built for contractors &amp; trades
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight max-w-4xl mx-auto">
          Bid Smarter.{" "}
          <span className="text-orange-500">Build Bigger.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The all-in-one platform for construction companies and trade
          professionals to estimate bids, track profit margins, manage clients,
          and grow their business.
        </p>

        {/* Waitlist Form */}
        <div className="mt-10 max-w-md mx-auto">
          {submitted ? (
            <div className="bg-green-50 text-green-700 rounded-xl p-6 text-center">
              <p className="font-semibold text-lg">You&apos;re on the list!</p>
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
              />
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-600"
              >
                <option value="">Select your trade (optional)</option>
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join the Waitlist"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: "15%", label: "Avg. margin improvement" },
            { stat: "3hrs", label: "Saved per bid" },
            { stat: "2x", label: "More bids submitted" },
            { stat: "98%", label: "Bid accuracy rate" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-bold text-orange-500">{s.stat}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Everything you need to win more work
          </h2>
          <p className="text-slate-600 mt-4 max-w-xl mx-auto">
            From first estimate to final invoice — Prospect IT handles the
            business side so you can focus on the build.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trades We Serve */}
      <section id="trades" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Built for every trade
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto mb-12">
            Whether you&apos;re a one-truck operation or running a 50-person crew,
            Prospect IT scales with your business.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "General Contractors", "Electricians", "Plumbers", "HVAC Technicians",
              "Roofers", "Concrete Contractors", "Framers", "Painters",
              "Landscapers", "Excavation", "Drywall", "Flooring", "Masonry",
              "Welding", "Demolition",
            ].map((t) => (
              <span key={t} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Simple, honest pricing</h2>
          <p className="text-slate-600 mt-4">No per-seat fees. No hidden costs. Cancel anytime.</p>
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
              className={`rounded-xl p-8 ${
                plan.popular
                  ? "bg-slate-900 text-white ring-2 ring-orange-500 scale-105"
                  : "bg-white border border-slate-200"
              }`}
            >
              {plan.popular && (
                <span className="text-xs font-semibold bg-orange-500 text-white px-3 py-1 rounded-full">
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
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className={`text-sm flex items-start gap-2 ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                    <span className="text-orange-500 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className={`w-full mt-8 py-3 rounded-lg font-semibold transition ${
                plan.popular
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-500 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Stop leaving money on the table</h2>
          <p className="text-orange-100 mt-4 text-lg">
            Join hundreds of contractors who are bidding smarter, tracking margins, and growing their businesses with Prospect IT.
          </p>
          <Link href="/register" className="inline-block mt-8 bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-white font-semibold">Prospect <span className="text-orange-500">IT</span></span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <a href="mailto:nathan@prospectit.com" className="hover:text-white transition">Contact</a>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Prospect IT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
