import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function calculateBidTotals(bidData: {
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  subcontractorCost: number;
  permitCost: number;
  overheadPercent: number;
  profitPercent: number;
  contingencyPercent: number;
}) {
  const subtotal =
    bidData.materialCost +
    bidData.laborCost +
    bidData.equipmentCost +
    bidData.subcontractorCost +
    bidData.permitCost;

  const overhead = subtotal * (bidData.overheadPercent / 100);
  const profit = subtotal * (bidData.profitPercent / 100);
  const contingency = subtotal * (bidData.contingencyPercent / 100);
  const totalBid = subtotal + overhead + profit + contingency;
  const profitMargin = totalBid > 0 ? (profit / totalBid) * 100 : 0;

  return {
    subtotal,
    overhead,
    profit,
    contingency,
    totalBid,
    profitMargin,
  };
}

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

    const userId = (session.user as any).id;
    const { id } = await params;

    const bid = await prisma.bid.findUnique({
      where: { id },
      include: { lineItems: true },
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

    const userId = (session.user as any).id;
    const { id } = await params;
    const data = await request.json();

    // Verify ownership
    const existingBid = await prisma.bid.findUnique({
      where: { id },
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
    });

    const bid = await prisma.bid.update({
      where: { id },
      data: {
        jobName: data.jobName ?? existingBid.jobName,
        description: data.description ?? existingBid.description,
        tradeType: data.tradeType ?? existingBid.tradeType,
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

    const userId = (session.user as any).id;
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
