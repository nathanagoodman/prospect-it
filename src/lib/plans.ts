/**
 * Plan definitions — the single source of truth for pricing.
 *
 * Deliberately free of any Stripe import so client components can use it
 * without pulling the Stripe SDK (and a server-only secret key) into the
 * browser bundle. `lib/stripe.ts` attaches the price IDs on the server.
 *
 * The landing page and the pricing page previously each hardcoded their own
 * copies of this list, which is how they ended up advertising different tier
 * names and different trial lengths. Both now read from here.
 *
 * RULE: only list a feature without `comingSoon` if it actually works in
 * production today. Selling something unbuilt is a refund liability.
 */

export interface PlanFeature {
  label: string;
  /** Shown with a "Soon" badge and excluded from what the price buys today. */
  comingSoon?: boolean;
}

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  description: string;
  price: number;
  badge: string | null;
  accentColor: "orange" | "blue" | "purple";
  features: PlanFeature[];
  cta: string;
  limits: {
    bidsPerMonth: number;
    clients: number;
    invoices: number;
    multiTrade: boolean;
  };
}

export type PlanKey = "PRO" | "GC_PRO" | "GC_ELITE";

export const TRIAL_DAYS = 7;

export const PLAN_LIST: PlanDefinition[] = [
  {
    key: "PRO",
    name: "Pro",
    description: "Built for trade professionals",
    price: 49,
    badge: null,
    accentColor: "orange",
    features: [
      { label: "Single trade profile" },
      { label: "Unlimited bids" },
      { label: "Trade-specific cost inputs" },
      { label: "Invoicing & estimates with PDF export" },
      { label: "Unlimited clients" },
      { label: "Company branding on documents" },
      { label: "Automated email sequences", comingSoon: true },
    ],
    cta: `Start ${TRIAL_DAYS}-Day Free Trial`,
    limits: { bidsPerMonth: -1, clients: -1, invoices: -1, multiTrade: false },
  },
  {
    key: "GC_PRO",
    name: "GC Pro",
    description: "For general contractors managing full projects",
    price: 99,
    badge: "Most Popular",
    accentColor: "blue",
    features: [
      { label: "Everything in Pro" },
      { label: "Multi-trade project bidding" },
      { label: "Sub bid coordination" },
      { label: "GC-specific cost tracking" },
      { label: "Job tracking" },
      { label: "Priority support" },
      { label: "Change orders & daily logs", comingSoon: true },
    ],
    cta: `Start ${TRIAL_DAYS}-Day Free Trial`,
    limits: { bidsPerMonth: -1, clients: -1, invoices: -1, multiTrade: true },
  },
  {
    key: "GC_ELITE",
    name: "GC Elite",
    description: "For established firms scaling operations",
    price: 249,
    badge: "Best Value",
    accentColor: "purple",
    features: [
      { label: "Everything in GC Pro" },
      { label: "Dedicated onboarding" },
      { label: "Priority feature requests" },
      { label: "AI plan set reading (auto-generate bids)", comingSoon: true },
      { label: "AI-powered bid optimization", comingSoon: true },
      { label: "Custom sub rate cards", comingSoon: true },
      { label: "Advanced analytics & reporting", comingSoon: true },
    ],
    cta: `Start ${TRIAL_DAYS}-Day Free Trial`,
    limits: { bidsPerMonth: -1, clients: -1, invoices: -1, multiTrade: true },
  },
];

export const PLAN_BY_KEY: Record<PlanKey, PlanDefinition> = PLAN_LIST.reduce(
  (acc, plan) => {
    acc[plan.key] = plan;
    return acc;
  },
  {} as Record<PlanKey, PlanDefinition>
);

/** Monthly price by plan key, for MRR maths. */
export const PLAN_PRICE: Record<PlanKey, number> = {
  PRO: 49,
  GC_PRO: 99,
  GC_ELITE: 249,
};
