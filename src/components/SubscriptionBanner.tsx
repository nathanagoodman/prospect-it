"use client";

import Link from "next/link";

interface SubscriptionBannerProps {
  plan: string | null;
  status: string | null;
}

export default function SubscriptionBanner({ plan, status }: SubscriptionBannerProps) {
  const isActive = status === "TRIALING" || status === "ACTIVE";
  const isTrialing = status === "TRIALING";
  const isPastDue = status === "PAST_DUE";

  if (isActive && !isTrialing) return null; // fully active, no banner needed

  if (isTrialing) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-600 text-sm font-semibold">Free trial active</span>
          <span className="text-amber-500 text-xs">Your 7-day trial is running. Add a payment method to keep access.</span>
        </div>
        <Link
          href="/pricing"
          className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors"
        >
          Manage Plan
        </Link>
      </div>
    );
  }

  if (isPastDue) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-sm font-semibold">Payment failed</span>
          <span className="text-red-500 text-xs">Please update your payment method to continue using Pro Spec IQ.</span>
        </div>
        <Link
          href="/pricing"
          className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
        >
          Update Payment
        </Link>
      </div>
    );
  }

  // No subscription
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-orange-400 text-sm font-semibold">No active plan</span>
        <span className="text-slate-400 text-xs">Subscribe to unlock all features with a 7-day free trial.</span>
      </div>
      <Link
        href="/pricing"
        className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
      >
        Choose a Plan
      </Link>
    </div>
  );
}
