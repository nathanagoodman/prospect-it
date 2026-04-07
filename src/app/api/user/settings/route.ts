import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        phone: true,
        tier: true,
        tradeType: true,
        enabledTrades: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Get user settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    // Validate tier if provided
    if (data.tier && !["GC", "TRADE"].includes(data.tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be GC or TRADE" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.tier !== undefined) updateData.tier = data.tier;
    if (data.tradeType !== undefined) updateData.tradeType = data.tradeType;
    if (data.enabledTrades !== undefined) {
      // Validate enabledTrades is an array
      if (!Array.isArray(data.enabledTrades)) {
        return NextResponse.json(
          { error: "enabledTrades must be an array" },
          { status: 400 }
        );
      }
      updateData.enabledTrades = data.enabledTrades;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        phone: true,
        tier: true,
        tradeType: true,
        enabledTrades: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Update user settings error:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
