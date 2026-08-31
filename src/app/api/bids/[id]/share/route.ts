import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function ownedBid(id: string, userId: string) {
  const bid = await prisma.bid.findUnique({
    where: { id },
    select: { id: true, userId: true, shareToken: true },
  });
  if (!bid) return { error: "Bid not found", status: 404 as const, bid: null };
  if (bid.userId !== userId)
    return { error: "Forbidden", status: 403 as const, bid: null };
  return { error: null, status: 200 as const, bid };
}

/** Creates (or returns) the public share link for a bid. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const check = await ownedBid(id, session.user.id);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    // Reuse the existing token so a link already sent to a customer keeps
    // working. Regenerating silently would break it.
    let token = check.bid!.shareToken;
    if (!token) {
      // 24 bytes → 192 bits of entropy, url-safe. Not enumerable.
      token = crypto.randomBytes(24).toString("base64url");
      await prisma.bid.update({
        where: { id },
        data: { shareToken: token, sharedAt: new Date() },
      });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[bids/share POST]", error);
    return NextResponse.json(
      { error: "Could not create share link" },
      { status: 500 }
    );
  }
}

/** Revokes the share link. Anyone holding the old URL loses access. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const check = await ownedBid(id, session.user.id);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    await prisma.bid.update({
      where: { id },
      // Reset telemetry too — otherwise a re-shared bid shows the previous
      // link's view count as if it belonged to the new one.
      data: { shareToken: null, sharedAt: null, viewCount: 0, lastViewedAt: null },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[bids/share DELETE]", error);
    return NextResponse.json(
      { error: "Could not revoke share link" },
      { status: 500 }
    );
  }
}
