import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ActivityType =
  | "login"
  | "signup"
  | "bid_created"
  | "bid_submitted"
  | "job_created"
  | "invoice_created"
  | "client_created"
  | "subscription_started"
  | "subscription_canceled";

/**
 * Records a product-usage event and stamps the user as active.
 *
 * Deliberately fire-and-forget: analytics must never break a user action,
 * so all failures are swallowed after logging.
 */
export async function logActivity(
  userId: string,
  type: ActivityType,
  metadata?: Prisma.InputJsonValue
): Promise<void> {
  if (!userId) return;

  try {
    await prisma.$transaction([
      prisma.activity.create({
        data: { userId, type, metadata: metadata ?? undefined },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          lastActiveAt: new Date(),
          ...(type === "login" ? { loginCount: { increment: 1 } } : {}),
        },
      }),
    ]);
  } catch (error) {
    console.error(`[activity] failed to log "${type}" for ${userId}:`, error);
  }
}

/** Updates lastActiveAt without writing an Activity row. */
export async function touchUser(userId: string): Promise<void> {
  if (!userId) return;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });
  } catch (error) {
    console.error(`[activity] failed to touch ${userId}:`, error);
  }
}

export const ACTIVITY_LABELS: Record<string, string> = {
  login: "Logged in",
  signup: "Signed up",
  bid_created: "Created a bid",
  bid_submitted: "Submitted a bid",
  job_created: "Created a job",
  invoice_created: "Created an invoice",
  client_created: "Added a client",
  subscription_started: "Started a subscription",
  subscription_canceled: "Canceled subscription",
};
