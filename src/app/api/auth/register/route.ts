import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { enforceRateLimit } from "@/lib/rate-limit";
import { registerSchema, firstError } from "@/lib/validation";
import { TOS_VERSION } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // 5 signups per IP per 15 minutes.
  const limited = enforceRateLimit(req, "register", 5, 15 * 60_000);
  if (limited) return limited;

  try {
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstError(parsed.error) },
        { status: 400 }
      );
    }

    const { email, password, name, company, tradeType, tier, enabledTrades } =
      parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        hashedPassword,
        company: company || null,
        tradeType: tradeType || null,
        tier,
        enabledTrades: enabledTrades ?? [],
        tosAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
        tosVersion: TOS_VERSION,
      },
    });

    await logActivity(user.id, "signup", { provider: "credentials", tier });

    // Close the loop on the waitlist: if this person was waiting, the lead
    // is now converted and should show that way in the admin pipeline.
    await prisma.waitlistEntry.updateMany({
      where: { email, stage: { not: "CONVERTED" } },
      data: {
        stage: "CONVERTED",
        convertedAt: new Date(),
        convertedUserId: user.id,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
