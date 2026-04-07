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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

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

    const userId = (session.user as any).id;
    const data = await request.json();

    // Validate required fields
    if (!data.jobName || !data.tradeType) {
      return NextResponse.json(
        { error: "jobName and tradeType are required" },
        { status: 400 }
      );
    }

    // Calculate totals
    const totals = calculateBidTotals({
      materialCost: data.materialCost || 0,
      laborCost: data.laborCost || 0,
      equipmentCost: data.equipmentCost || 0,
      subcontractorCost: data.subcontractorCost || 0,
      permitCost: data.permitCost || 0,
      overheadPercent: data.overheadPercent || 10,
      profitPercent: data.profitPercent || 15,
      contingencyPercent: data.contingencyPercent || 5,
    });

    const bid = await prisma.bid.create({
      data: {
        userId,
        jobName: data.jobName,
        description: data.description || null,
        tradeType: data.tradeType,
        clientId: data.clientId || null,
        materialCost: data.materialCost || 0,
        laborCost: data.laborCost || 0,
        laborHours: data.laborHours || 0,
        laborRate: data.laborRate || 0,
        equipmentCost: data.equipmentCost || 0,
        subcontractorCost: data.subcontractorCost || 0,
        permitCost: data.permitCost || 0,
        overheadPercent: data.overheadPercent || 10,
        profitPercent: data.profitPercent || 15,
        contingencyPercent: data.contingencyPercent || 5,
        ...totals,
        status: data.status || "DRAFT",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: { lineItems: true },
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error("Create bid error:", error);
    return NextResponse.json(
      { error: "Failed to create bid" },
      { status: 500 }
    );
  }
}
