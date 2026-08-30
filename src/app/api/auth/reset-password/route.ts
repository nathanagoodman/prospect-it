import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema, firstError } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // 5 attempts per IP per 15 minutes.
  const limited = enforceRateLimit(request, "reset-password", 5, 15 * 60_000);
  if (limited) return limited;

  try {
    const parsed = resetPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstError(parsed.error) },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Drop any other outstanding tokens for this user.
      prisma.passwordResetToken.deleteMany({
        where: { userId: record.userId, usedAt: null },
      }),
    ]);

    return NextResponse.json({
      message: "Password updated. You can now sign in.",
    });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { error: "Could not reset password" },
      { status: 500 }
    );
  }
}
