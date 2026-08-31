import Stripe from "stripe";
import { PLAN_BY_KEY } from "./plans";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PLANS = {
  PRO: {
    ...PLAN_BY_KEY.PRO,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
  },
  GC_PRO: {
    ...PLAN_BY_KEY.GC_PRO,
    priceId: process.env.STRIPE_GC_PRICE_ID || "",
  },
  GC_ELITE: {
    ...PLAN_BY_KEY.GC_ELITE,
    priceId: process.env.STRIPE_ELITE_PRICE_ID || "",
  },
};

export type PlanKey = keyof typeof PLANS;
