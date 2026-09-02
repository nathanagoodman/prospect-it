import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Read-only signup stats for the portfolio dashboard.
 * Requires STATS_TOKEN to be set; responds 404 without a valid token
 * so the route is invisible to probes.
 */
export async function GET(req: Request) {
  const token = process.env.STATS_TOKEN;
  const auth = req.headers.get("authorization");
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const now = Date.now();
  const d7 = new Date(now - 7 * 86_400_000);
  const d30 = new Date(now - 30 * 86_400_000);

  const [users, users7, users30, waitlist, waitlist7] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: d7 } } }),
    prisma.user.count({ where: { createdAt: { gte: d30 } } }),
    prisma.waitlistEntry.count(),
    prisma.waitlistEntry.count({ where: { createdAt: { gte: d7 } } }),
  ]);

  return NextResponse.json({
    product: "prospeciq",
    users: { total: users, last7Days: users7, last30Days: users30 },
    waitlist: { total: waitlist, last7Days: waitlist7 },
    generatedAt: new Date().toISOString(),
  });
}
