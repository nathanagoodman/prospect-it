import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import { PLAN_PRICE, type PlanKey } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Prices come from the shared plan module, which has no Stripe import —
// so this route never constructs a Stripe client (which would throw when
// STRIPE_SECRET_KEY is absent).

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // All independent — run concurrently rather than sequentially.
    const [
      totalLeads,
      leadsByStage,
      recentLeads,
      convertedLeads,
      totalUsers,
      newUsers7d,
      usersByPlan,
      usersByStatus,
      activeUsers7d,
      activeUsers30d,
      totalBids,
      bids7d,
      totalJobs,
      totalInvoices,
      bidAggregate,
      subscriptions,
    ] = await Promise.all([
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.groupBy({
        by: ["stage"],
        _count: { id: true },
      }),
      prisma.waitlistEntry.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.waitlistEntry.count({ where: { stage: "CONVERTED" } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.groupBy({
        by: ["subscriptionPlan"],
        _count: { id: true },
      }),
      prisma.user.groupBy({
        by: ["subscriptionStatus"],
        _count: { id: true },
      }),
      prisma.user.count({ where: { lastActiveAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { lastActiveAt: { gte: thirtyDaysAgo } } }),
      prisma.bid.count(),
      prisma.bid.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.job.count(),
      prisma.invoice.count(),
      prisma.bid.aggregate({ _sum: { totalBid: true }, _avg: { totalBid: true } }),
      prisma.subscription.findMany({
        where: { status: { in: ["ACTIVE", "TRIALING"] } },
        select: { plan: true, status: true },
      }),
    ]);

    // MRR is derived from real subscription rows and the plan price table,
    // counting only ACTIVE (trials contribute $0 until they convert).
    const subs: { plan: string; status: string }[] = subscriptions;

    let mrr = 0;
    let trialing = 0;
    let trialPipeline = 0;
    let paying = 0;

    for (const sub of subs) {
      const price = PLAN_PRICE[sub.plan as PlanKey] ?? 0;
      if (sub.status === "ACTIVE") {
        mrr += price;
        paying += 1;
      }
      if (sub.status === "TRIALING") {
        trialing += 1;
        trialPipeline += price;
      }
    }

    const stageMap: Record<string, number> = {};
    for (const row of leadsByStage) stageMap[row.stage] = row._count.id;

    const planMap: Record<string, number> = {};
    for (const row of usersByPlan) {
      planMap[row.subscriptionPlan ?? "NONE"] = row._count.id;
    }

    const statusMap: Record<string, number> = {};
    for (const row of usersByStatus) {
      statusMap[row.subscriptionStatus ?? "NONE"] = row._count.id;
    }

    return NextResponse.json({
      leads: {
        total: totalLeads,
        byStage: stageMap,
        recentWeek: recentLeads,
        converted: convertedLeads,
        conversionRate:
          totalLeads > 0
            ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
            : 0,
      },
      users: {
        total: totalUsers,
        newThisWeek: newUsers7d,
        byPlan: planMap,
        byStatus: statusMap,
        active7d: activeUsers7d,
        active30d: activeUsers30d,
        engagementRate:
          totalUsers > 0
            ? Number(((activeUsers7d / totalUsers) * 100).toFixed(1))
            : 0,
      },
      revenue: {
        mrr,
        arr: mrr * 12,
        trialing,
        trialPipeline,
        paying,
      },
      product: {
        totalBids,
        bidsThisWeek: bids7d,
        totalJobs,
        totalInvoices,
        totalBidValue: bidAggregate._sum.totalBid ?? 0,
        avgBidValue: bidAggregate._avg.totalBid ?? 0,
      },
    });
  } catch (error) {
    console.error("[admin/stats]", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
