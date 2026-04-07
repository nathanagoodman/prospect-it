// Subscription plan hierarchy and feature gating

export type PlanLevel = "NONE" | "PRO" | "GC_PRO" | "GC_ELITE";

const PLAN_HIERARCHY: Record<PlanLevel, number> = {
  NONE: 0,
  PRO: 1,
  GC_PRO: 2,
  GC_ELITE: 3,
};

export function hasAccess(userPlan: PlanLevel | null | undefined, requiredPlan: PlanLevel): boolean {
  const userLevel = PLAN_HIERARCHY[userPlan || "NONE"];
  const requiredLevel = PLAN_HIERARCHY[requiredPlan];
  return userLevel >= requiredLevel;
}

export function isActiveSubscription(status: string | null | undefined): boolean {
  if (!status) return false;
  return ["TRIALING", "ACTIVE"].includes(status);
}

// Feature flags per plan
export const FEATURES = {
  // PRO and above
  unlimitedBids: "PRO" as PlanLevel,
  invoicing: "PRO" as PlanLevel,
  emailSequences: "PRO" as PlanLevel,
  companyBranding: "PRO" as PlanLevel,
  tradeMetrics: "PRO" as PlanLevel,

  // GC_PRO and above
  multiTradeBidding: "GC_PRO" as PlanLevel,
  subCoordination: "GC_PRO" as PlanLevel,
  projectManagement: "GC_PRO" as PlanLevel,

  // GC_ELITE only
  aiPlanReading: "GC_ELITE" as PlanLevel,
  aiOptimization: "GC_ELITE" as PlanLevel,
  customRateCards: "GC_ELITE" as PlanLevel,
  advancedAnalytics: "GC_ELITE" as PlanLevel,
};

export function canUseFeature(
  userPlan: PlanLevel | null | undefined,
  subscriptionStatus: string | null | undefined,
  feature: keyof typeof FEATURES
): boolean {
  if (!isActiveSubscription(subscriptionStatus)) return false;
  return hasAccess(userPlan, FEATURES[feature]);
}
