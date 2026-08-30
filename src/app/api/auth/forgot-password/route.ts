import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema, firstError } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/notifications";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Identical response in every case so this endpoint can't be used to
// discover which email addresses have accounts.
const GENERIC_RESPONSE = {
  message:
    "If an account exists for that email, we've sent a password reset link.",
};

export async function POST(request: NextRequest) {
  // 3 requests per IP per 15 minutes.
  const limited = enforceRateLimit(request, "forgot-password", 3, 15 * 60_000);
  if (limited) return limited;

  try {
    const parsed = forgotPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstError(parsed.error) },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Only issue a token for accounts that can actually use one — an
    // OAuth-only user has no password to reset.
    // Opportunistic cleanup so spent/expired tokens don't accumulate
    // forever. Cheap thanks to the @@index([expiresAt]).
    void prisma.passwordResetToken
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => {});

    if (user?.hashedPassword) {
      // Invalidate any outstanding tokens before issuing a new one.
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });

      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: tokenHash, // only the hash is stored
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const baseUrl =
        process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
        "https://www.prospeciq.com";
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

      // Deliberately not awaited. Awaiting the Resend round-trip would make
      // responses for real accounts measurably slower than for unknown ones,
      // which reintroduces the account-enumeration leak the generic response
      // above is meant to close.
      void sendPasswordResetEmail({
        to: user.email!,
        name: user.name,
        resetUrl,
      }).catch((error) => {
        console.error("[forgot-password] email send failed:", error);
      });
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("[forgot-password]", error);
    // Still generic — don't leak failure modes.
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
