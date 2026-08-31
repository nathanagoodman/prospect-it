"use client";

import { PLAN_LIST } from "@/lib/plans";

import { useState, useEffect } from "react";
import Link from "next/link";


export default function PricingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in without requiring SessionProvider
    fetch("/api/user/settings")
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (planKey: string) => {
    if (!isLoggedIn) {
      window.location.href = `/login?callbackUrl=/pricing`;
      return;
    }

    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-lg font-black text-white">PRO</span>
            <span className="text-lg font-black text-orange-500">SPEC</span>
            <span className="text-sm font-bold text-slate-500 ml-0.5">IQ</span>
          </Link>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <Link
                href="/app"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Every plan includes a 7-day free trial. No credit card charged until your trial ends.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLAN_LIST.map((plan) => {
            const isPopular = plan.badge === "Most Popular";
            return (
              <div
                key={plan.key}
                className={`relative bg-white rounded-2xl border-2 shadow-sm p-8 flex flex-col ${
                  isPopular
                    ? "border-blue-500 shadow-lg shadow-blue-100 scale-[1.02]"
                    : "border-slate-200"
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white ${
                      isPopular ? "bg-blue-500" : "bg-purple-500"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900">${plan.price}</span>
                    <span className="text-slate-500 font-medium">/mo</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">7-day free trial included</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          feature.comingSoon
                            ? "text-slate-300"
                            : plan.accentColor === "orange"
                            ? "text-orange-500"
                            : plan.accentColor === "blue"
                            ? "text-blue-500"
                            : "text-purple-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span
                        className={
                          feature.comingSoon ? "text-slate-400" : "text-slate-700"
                        }
                      >
                        {feature.label}
                        {feature.comingSoon && (
                          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Soon
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={loading === plan.key}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${
                    isPopular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : plan.accentColor === "purple"
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {loading === plan.key ? "Redirecting..." : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ / Trust */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            Cancel anytime. No long-term contracts. Questions?{" "}
            <a href="mailto:nathanagoodman@gmail.com" className="text-orange-600 hover:text-orange-700 font-medium">
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
