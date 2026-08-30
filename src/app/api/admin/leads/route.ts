import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const STAGES = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "TRIAL",
  "CONVERTED",
  "CHURNED",
] as const;
type Stage = (typeof STAGES)[number];

// Only these fields may be written through this endpoint. Without an
// allowlist, a malformed client could overwrite createdAt, id, etc.
const EDITABLE = ["name", "company", "trade", "stage", "score", "source"] as const;

export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const stage = searchParams.get("stage");
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(10, Number(searchParams.get("pageSize")) || 50)
    );

    const where: Prisma.WaitlistEntryWhereInput = {};

    if (stage && stage !== "all" && STAGES.includes(stage as Stage)) {
      where.stage = stage as Stage;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { trade: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.waitlistEntry.findMany({
        where,
        include: {
          notes: { orderBy: { createdAt: "desc" } },
          _count: { select: { notes: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.waitlistEntry.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[admin/leads GET]", error);
    return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    const existing = await prisma.waitlistEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const data: Prisma.WaitlistEntryUpdateInput = {};

    for (const field of EDITABLE) {
      if (!(field in body)) continue;
      const value = body[field];

      if (field === "stage") {
        if (!STAGES.includes(value)) {
          return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
        }
        data.stage = value;
        // Stamp the conversion date the first time a lead reaches CONVERTED.
        if (value === "CONVERTED" && !existing.convertedAt) {
          data.convertedAt = new Date();
        }
      } else if (field === "score") {
        const score = Number(value);
        if (Number.isNaN(score) || score < 0 || score > 100) {
          return NextResponse.json(
            { error: "Score must be between 0 and 100" },
            { status: 400 }
          );
        }
        data.score = score;
      } else if (field === "source") {
        // source is non-nullable with a default — never write null into it.
        data.source = typeof value === "string" && value.trim()
          ? value.trim()
          : "waitlist";
      } else {
        data[field] = value === "" ? null : value;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const lead = await prisma.waitlistEntry.update({
      where: { id },
      data,
      include: {
        notes: { orderBy: { createdAt: "desc" } },
        _count: { select: { notes: true } },
      },
    });

    // Record stage transitions in the activity log so the history is visible.
    if (data.stage && data.stage !== existing.stage) {
      await prisma.leadNote.create({
        data: {
          leadId: id,
          type: "status_change",
          content: `Stage changed from ${existing.stage} to ${data.stage} by ${admin.email}`,
        },
      });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("[admin/leads PUT]", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    await prisma.waitlistEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/leads DELETE]", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
