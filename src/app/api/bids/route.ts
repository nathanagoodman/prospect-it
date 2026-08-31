import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import {
  normalizeLineItems,
  sumLineItems,
  calculateBidTotals,
} from "@/lib/bid-calc";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const bids = await prisma.bid.findMany({
      where: { userId },
      include: { lineItems: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bids, { status: 200 });
  } catch (error) {
    console.error("Get bids error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const data = await request.json();

    // Validate required fields
    if (!data.jobName || !data.tradeType) {
      return NextResponse.json(
        { error: "jobName and tradeType are required" },
        { status: 400 }
      );
    }

    const lineItems = normalizeLineItems(data.lineItems);
    const lineItemsTotal = sumLineItems(lineItems);

    // GC bids carry their value in sub bids (sent as line items) plus
    // project-level costs, not in the material/labor buckets. Without
    // these, every GC bid computed to zero.
    const isGC = data.tradeType === "general";

    const totals = calculateBidTotals({
      materialCost: data.materialCost || 0,
      laborCost: data.laborCost || 0,
      equipmentCost: data.equipmentCost || 0,
      subcontractorCost: data.subcontractorCost || 0,
      permitCost: data.permitCost || 0,
      overheadPercent: data.overheadPercent ?? 10,
      profitPercent: data.profitPercent ?? 15,
      contingencyPercent: data.contingencyPercent ?? 5,
      lineItemsTotal,
      gcInsuranceCost: isGC ? data.gcInsuranceCost || 0 : 0,
      gcPermitCost: isGC ? data.gcPermitCost || 0 : 0,
      gcManagementPercent: isGC ? data.gcManagementPercent || 0 : 0,
    });

    // Preserve the trade-specific inputs the user filled in. These were
    // previously collected, displayed, and then discarded on save.
    const tradeMetrics =
      data.tradeMetrics && typeof data.tradeMetrics === "object"
        ? {
            ...data.tradeMetrics,
            ...(isGC
              ? {
                  selectedTrades: data.selectedTrades ?? [],
                  gcInsuranceCost: data.gcInsuranceCost || 0,
                  gcPermitCost: data.gcPermitCost || 0,
                  gcManagementPercent: data.gcManagementPercent || 0,
                }
              : {}),
          }
        : undefined;

    const bid = await prisma.bid.create({
      data: {
        userId,
        jobName: data.jobName,
        description: data.description || null,
        tradeType: data.tradeType,
        tradeMetrics,
        clientId: data.clientId || null,
        materialCost: data.materialCost || 0,
        laborCost: data.laborCost || 0,
        laborHours: data.laborHours || 0,
        laborRate: data.laborRate || 0,
        equipmentCost: data.equipmentCost || 0,
        subcontractorCost: data.subcontractorCost || 0,
        permitCost: data.permitCost || 0,
        overheadPercent: data.overheadPercent ?? 10,
        profitPercent: data.profitPercent ?? 15,
        contingencyPercent: data.contingencyPercent ?? 5,
        ...totals,
        status: data.status || "DRAFT",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        // Persist line items. Previously collected by the form, posted,
        // and then silently dropped — this table had never held a row.
        lineItems: lineItems.length ? { create: lineItems } : undefined,
      },
      include: { lineItems: true },
    });

    await logActivity(userId, "bid_created", { bidId: bid.id, jobName: bid.jobName, total: bid.totalBid });

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error("Create bid error:", error);
    return NextResponse.json(
      { error: "Failed to create bid" },
      { status: 500 }
    );
  }
}
