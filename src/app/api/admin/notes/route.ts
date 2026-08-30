import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const NOTE_TYPES = ["note", "email", "call", "status_change"] as const;

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { leadId, content, type = "note" } = await request.json();

    if (!leadId || typeof leadId !== "string") {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (!NOTE_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid note type" }, { status: 400 });
    }

    const lead = await prisma.waitlistEntry.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const note = await prisma.leadNote.create({
      data: { leadId, content: content.trim(), type },
    });

    // Outreach bumps the last-contacted date; a plain note does not.
    if (type === "email" || type === "call") {
      await prisma.waitlistEntry.update({
        where: { id: leadId },
        data: { lastContactedAt: new Date() },
      });
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("[admin/notes POST]", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
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
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }
    await prisma.leadNote.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/notes DELETE]", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
