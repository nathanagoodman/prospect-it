import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PLANS = {
  PRO: {
    name: "Pro",
    description: "Built for trade professionals",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "Single trade profile",
      "Unlimited bids",
      "Trade-specific metrics & analytics",
      "Invoicing & estimates",
      "Unlimited clients",
      "Email sequences",
      "Company branding",
    ],
    limits: {
      bidsPerMonth: -1,
      clients: -1,
      invoices: -1,
      multiTrade: false,
    },
  },
  GC_PRO: {
    name: "GC Pro",
    description: "For General Contractors managing full projects",
    price: 99,
    priceId: process.env.STRIPE_GC_PRICE_ID || "",
    features: [
      "Everything in Pro",
      "Multi-trade project bidding",
      "Sub bid coordination",
      "Full project management",
      "GC-specific cost tracking",
      "Priority support",
    ],
    limits: {
      bidsPerMonth: -1,
      clients: -1,
      invoices: -1,
      multiTrade: true,
    },
  },
  GC_ELITE: {
    name: "GC Elite",
    description: "The ultimate toolkit for top-tier GCs",
    price: 249,
    priceId: process.env.STRIPE_ELITE_PRICE_ID || "",
    features: [
      "Everything in GC Pro",
      "AI plan set reading (auto-generate bids)",
      "AI-powered bid optimization",
      "Custom sub rate cards",
      "Advanced analytics & reporting",
      "Dedicated onboarding",
    ],
    limits: {
      bidsPerMonth: -1,
      clients: -1,
      invoices: -1,
      multiTrade: true,
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;
