"use client";

import Link from "next/link";

interface PaywallProps {
  feature: string;
  requiredPlan: "Pro" | "GC Pro" | "GC Elite";
  children: React.ReactNode;
  currentPlan?: string | null;
  subscriptionStatus?: string | null;
}

export default function Paywall({
  feature,
  requiredPlan,
  children,
  currentPlan,
  subscriptionStatus,
}: PaywallProps) {
  const isActive = subscriptionStatus === "TRIALING" || subscriptionStatus === "ACTIVE";
  const planHierarchy: Record<string, number> = {
    PRO: 1,
    GC_PRO: 2,
    GC_ELITE: 3,
  };

  const requiredLevel = planHierarchy[requiredPlan === "Pro" ? "PRO" : requiredPlan === "GC Pro" ? "GC_PRO" : "GC_ELITE"];
  const userLevel = planHierarchy[currentPlan || ""] || 0;

  if (isActive && userLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none select-none blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center max-w-sm mx-4">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {feature} requires {requiredPlan}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Upgrade your plan to unlock {feature.toLowerCase()} and more powerful features.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
