import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");
    const days = Math.min(90, Math.max(1, Number(searchParams.get("days")) || 30));
    const limit = Math.min(200, Math.max(10, Number(searchParams.get("limit")) || 100));

    // Align to a UTC day boundary so the query window matches the chart's
    // calendar-day buckets exactly. A rolling instant would pull in rows
    // from a partial day that the buckets then silently discard.
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const where: Prisma.ActivityWhereInput = { createdAt: { gte: since } };
    if (type && type !== "all") where.type = type;
    if (userId) where.userId = userId;

    const [activities, byType, dailyRaw] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, company: true } },
        },
      }),
      prisma.activity.groupBy({
        by: ["type"],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }),
      prisma.activity.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
    ]);

    // Bucket into per-day counts for the sparkline, seeded from the same
    // UTC boundary used for `since` so every fetched row lands in a bucket.
    const daily: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setUTCDate(d.getUTCDate() + i);
      daily[d.toISOString().slice(0, 10)] = 0;
    }
    for (const row of dailyRaw) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (key in daily) daily[key] += 1;
    }

    const typeMap: Record<string, number> = {};
    for (const row of byType) typeMap[row.type] = row._count.id;

    return NextResponse.json({
      activities,
      byType: typeMap,
      daily: Object.entries(daily)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
    });
  } catch (error) {
    console.error("[admin/activity GET]", error);
    return NextResponse.json(
      { error: "Failed to load activity" },
      { status: 500 }
    );
  }
}
