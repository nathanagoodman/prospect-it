import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notifyNewSubscription, notifySubscriptionCanceled } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import Stripe from "stripe";

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

// ─── Event Handlers ─────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as PlanKey | undefined;

  if (!userId || !plan) {
    console.error("Missing metadata on checkout session");
    return;
  }

  const planConfig = PLANS[plan];

  // Look up user for notification
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  await logActivity(userId, "subscription_started", {
    plan: planConfig.name,
    amount: planConfig.price,
  });

  // Send admin notification
  if (user?.email) {
    await notifyNewSubscription({
      email: user.email,
      name: user.name,
      plan: planConfig.name,
      amount: planConfig.price,
      trial: true, // always starts with trial
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("No user found for Stripe customer:", customerId);
    return;
  }

  // Determine which plan from the price ID
  const priceId = subscription.items.data[0]?.price.id;
  let plan: PlanKey = "PRO";

  if (priceId === process.env.STRIPE_GC_PRICE_ID) {
    plan = "GC_PRO";
  } else if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
    plan = "GC_ELITE";
  }

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    trialing: "TRIALING",
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
  };

  const status = statusMap[subscription.status] || "ACTIVE";

  // Update or create subscription record
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId || "",
      plan: plan,
      status: status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripePriceId: priceId || "",
      plan: plan,
      status: status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Update user record
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionPlan: plan,
      subscriptionStatus: status as any,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  // Clear subscription data
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionPlan: null,
      subscriptionStatus: "CANCELED",
    },
  });

  // Update subscription record
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "CANCELED" },
  });

  // Notify admin
  if (user.email) {
    const priceId = subscription.items.data[0]?.price.id;
    let planName = "Pro";
    if (priceId === process.env.STRIPE_GC_PRICE_ID) planName = "GC Pro";
    if (priceId === process.env.STRIPE_ELITE_PRICE_ID) planName = "GC Elite";

    await logActivity(user.id, "subscription_canceled", { plan: planName });

    await notifySubscriptionCanceled({
      email: user.email,
      plan: planName,
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: "PAST_DUE" },
  });
}
