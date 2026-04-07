import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyWaitlistSignup } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const { email, name, company, trade } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email already on waitlist", entry: existing },
        { status: 200 }
      );
    }

    // Create new waitlist entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        email,
        name: name || null,
        company: company || null,
        trade: trade || null,
      },
    });

    // Notify admin about new signup
    await notifyWaitlistSignup({ email, name, company, trade });

    return NextResponse.json(
      { message: "Successfully added to waitlist", entry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to add to waitlist" },
      { status: 500 }
    );
  }
}
