import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeLineItems,
  sumLineItems,
  calculateBidTotals,
} from "@/lib/bid-calc";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = await params;

    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        lineItems: true,
        client: { select: { id: true, name: true, company: true } },
      },
    });

    if (!bid) {
      return NextResponse.json(
        { error: "Bid not found" },
        { status: 404 }
      );
    }

    if (bid.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(bid, { status: 200 });
  } catch (error) {
    console.error("Get bid error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bid" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = await params;
    const data = await request.json();

    // Verify ownership
    const existingBid = await prisma.bid.findUnique({
      where: { id },
      include: { lineItems: true },
    });

    if (!existingBid) {
      return NextResponse.json(
        { error: "Bid not found" },
        { status: 404 }
      );
    }

    if (existingBid.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // If the client sent line items, they replace the existing set.
    // Otherwise keep what's already saved so a partial update (e.g. a
    // status change) can't wipe them.
    const hasNewLineItems = Array.isArray(data.lineItems);
    const lineItems = hasNewLineItems ? normalizeLineItems(data.lineItems) : [];
    const lineItemsTotal = hasNewLineItems
      ? sumLineItems(lineItems)
      : sumLineItems(existingBid.lineItems);

    const tradeType = data.tradeType ?? existingBid.tradeType;
    const isGC = tradeType === "general";
    const existingMetrics =
      (existingBid.tradeMetrics as Record<string, unknown> | null) ?? {};
    const metrics = { ...existingMetrics, ...(data.tradeMetrics ?? {}) };

    const gcNum = (key: string) =>
      isGC ? Number(data[key] ?? metrics[key] ?? 0) || 0 : 0;

    // Calculate new totals
    const totals = calculateBidTotals({
      materialCost: data.materialCost ?? existingBid.materialCost,
      laborCost: data.laborCost ?? existingBid.laborCost,
      equipmentCost: data.equipmentCost ?? existingBid.equipmentCost,
      subcontractorCost: data.subcontractorCost ?? existingBid.subcontractorCost,
      permitCost: data.permitCost ?? existingBid.permitCost,
      overheadPercent: data.overheadPercent ?? existingBid.overheadPercent,
      profitPercent: data.profitPercent ?? existingBid.profitPercent,
      contingencyPercent: data.contingencyPercent ?? existingBid.contingencyPercent,
      lineItemsTotal,
      gcInsuranceCost: gcNum("gcInsuranceCost"),
      gcPermitCost: gcNum("gcPermitCost"),
      gcManagementPercent: gcNum("gcManagementPercent"),
    });

    const bid = await prisma.bid.update({
      where: { id },
      data: {
        jobName: data.jobName ?? existingBid.jobName,
        description: data.description ?? existingBid.description,
        tradeType,
        tradeMetrics: metrics,
        clientId: data.clientId ?? existingBid.clientId,
        materialCost: data.materialCost ?? existingBid.materialCost,
        laborCost: data.laborCost ?? existingBid.laborCost,
        laborHours: data.laborHours ?? existingBid.laborHours,
        laborRate: data.laborRate ?? existingBid.laborRate,
        equipmentCost: data.equipmentCost ?? existingBid.equipmentCost,
        subcontractorCost: data.subcontractorCost ?? existingBid.subcontractorCost,
        permitCost: data.permitCost ?? existingBid.permitCost,
        overheadPercent: data.overheadPercent ?? existingBid.overheadPercent,
        profitPercent: data.profitPercent ?? existingBid.profitPercent,
        contingencyPercent: data.contingencyPercent ?? existingBid.contingencyPercent,
        ...totals,
        status: data.status ?? existingBid.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : existingBid.dueDate,
        ...(hasNewLineItems
          ? { lineItems: { deleteMany: {}, create: lineItems } }
          : {}),
      },
      include: { lineItems: true },
    });

    return NextResponse.json(bid, { status: 200 });
  } catch (error) {
    console.error("Update bid error:", error);
    return NextResponse.json(
      { error: "Failed to update bid" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = await params;

    // Verify ownership
    const bid = await prisma.bid.findUnique({
      where: { id },
    });

    if (!bid) {
      return NextResponse.json(
        { error: "Bid not found" },
        { status: 404 }
      );
    }

    if (bid.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.bid.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Bid deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete bid error:", error);
    return NextResponse.json(
      { error: "Failed to delete bid" },
      { status: 500 }
    );
  }
}
