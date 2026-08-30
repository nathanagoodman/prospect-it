import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PLANS = ["PRO", "GC_PRO", "GC_ELITE"];
const STATUSES = ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "UNPAID"];

export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search")?.trim();
    const plan = searchParams.get("plan");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "recent";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(10, Number(searchParams.get("pageSize")) || 50)
    );

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }
    // Validate against the enums — passing an unknown value straight to
    // Prisma throws and surfaces as a 500 instead of a 400.
    if (plan && plan !== "all") {
      if (plan === "NONE") {
        where.subscriptionPlan = null;
      } else if (PLANS.includes(plan)) {
        where.subscriptionPlan = plan as never;
      } else {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
    }
    if (status && status !== "all") {
      if (status === "NONE") {
        where.subscriptionStatus = null;
      } else if (STATUSES.includes(status)) {
        where.subscriptionStatus = status as never;
      } else {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    const orderBy: Prisma.UserOrderByWithRelationInput =
      sort === "active"
        ? { lastActiveAt: { sort: "desc", nulls: "last" } }
        : sort === "name"
          ? { email: "asc" }
          : { createdAt: "desc" };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          phone: true,
          role: true,
          tier: true,
          tradeType: true,
          createdAt: true,
          lastActiveAt: true,
          loginCount: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          subscription: {
            select: {
              plan: true,
              status: true,
              currentPeriodEnd: true,
              trialEnd: true,
              cancelAtPeriodEnd: true,
            },
          },
          _count: {
            select: {
              bids: true,
              jobs: true,
              clients: true,
              invoices: true,
              activities: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[admin/users GET]", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
