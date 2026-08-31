import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toClientLineItems } from "@/lib/bid-calc";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Public, unauthenticated proposal data for a shared bid.
 *
 * The response is assembled field by field rather than spreading the bid,
 * because a spread would leak overhead, profit, contingency, subtotal,
 * margin, cost basis, and the owner's user id to the customer. Everything
 * returned here is deliberate.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Tokens are unguessable, but rate limit anyway so the endpoint can't be
  // used to probe for valid ones.
  const limited = enforceRateLimit(request, "public-bid", 60, 60_000);
  if (limited) return limited;

  try {
    const { token } = await params;
    // The contractor's own "Preview" opens this page too; counting that
    // would corrupt the only signal the feature provides.
    const isPreview = request.nextUrl.searchParams.get("preview") === "1";

    if (!token || token.length < 20) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bid = await prisma.bid.findUnique({
      where: { shareToken: token },
      select: {
        id: true,
        jobName: true,
        description: true,
        tradeType: true,
        totalBid: true,
        dueDate: true,
        createdAt: true,
        // Needed only to build the client-safe line items below.
        materialCost: true,
        laborCost: true,
        laborHours: true,
        equipmentCost: true,
        subcontractorCost: true,
        permitCost: true,
        lineItems: {
          select: {
            description: true,
            category: true,
            quantity: true,
            unitPrice: true,
            total: true,
          },
        },
        client: { select: { name: true, company: true } },
        user: {
          select: {
            name: true,
            company: true,
            companyProfile: {
              select: {
                companyName: true,
                address: true,
                city: true,
                state: true,
                zip: true,
                phone: true,
                email: true,
                website: true,
                licenseNumber: true,
                logoBase64: true,
                accentColor: true,
                paymentTerms: true,
                footerText: true,
              },
            },
          },
        },
      },
    });

    if (!bid) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Awaited deliberately: a serverless function can be frozen the moment
    // it responds, so a fire-and-forget write here would be dropped and the
    // view count would silently under-report. One indexed update is cheap.
    if (!isPreview) {
      try {
        await prisma.bid.update({
          where: { id: bid.id },
          data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
        });
      } catch (e) {
        console.error("[public/bid] view tracking failed:", e);
      }
    }

    const lines = toClientLineItems(bid);
    const profile = bid.user.companyProfile;

    return NextResponse.json({
      jobName: bid.jobName,
      description: bid.description,
      tradeType: bid.tradeType,
      dueDate: bid.dueDate,
      createdAt: bid.createdAt,
      total: bid.totalBid,
      lineItems: lines,
      client: bid.client
        ? { name: bid.client.name, company: bid.client.company }
        : null,
      contractor: {
        name: profile?.companyName || bid.user.company || bid.user.name || "",
        address: profile?.address ?? null,
        city: profile?.city ?? null,
        state: profile?.state ?? null,
        zip: profile?.zip ?? null,
        phone: profile?.phone ?? null,
        email: profile?.email ?? null,
        website: profile?.website ?? null,
        licenseNumber: profile?.licenseNumber ?? null,
        logoBase64: profile?.logoBase64 ?? null,
        accentColor: profile?.accentColor ?? "#f97316",
      },
      paymentTerms: profile?.paymentTerms ?? null,
      footerText: profile?.footerText ?? null,
    });
  } catch (error) {
    console.error("[public/bid GET]", error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
