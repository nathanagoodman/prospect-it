import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyWaitlistSignup } from "@/lib/notifications";
import { enforceRateLimit } from "@/lib/rate-limit";
import { waitlistSchema, firstError } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // 5 submissions per IP per 10 minutes.
  const limited = enforceRateLimit(request, "waitlist", 5, 10 * 60_000);
  if (limited) return limited;

  try {
    const parsed = waitlistSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstError(parsed.error) },
        { status: 400 }
      );
    }

    const { email, name, company, trade } = parsed.data;

    const existing = await prisma.waitlistEntry.findUnique({
      where: { email },
    });

    // Respond identically whether or not the address was already on the
    // list, so this endpoint can't be used to test who has signed up.
    if (existing) {
      return NextResponse.json(
        { message: "You're on the list. We'll be in touch." },
        { status: 200 }
      );
    }

    await prisma.waitlistEntry.create({
      data: {
        email,
        name: name || null,
        company: company || null,
        trade: trade || null,
        source: "waitlist",
        stage: "NEW",
      },
    });

    // Notification failures must not fail the signup.
    try {
      await notifyWaitlistSignup({ email, name, company, trade });
    } catch (error) {
      console.error("Waitlist notification failed:", error);
    }

    return NextResponse.json(
      { message: "You're on the list. We'll be in touch." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to join the waitlist" },
      { status: 500 }
    );
  }
}
