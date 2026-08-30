import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAllowlistedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * One-time promotion of the signed-in, allowlisted user to ADMIN.
 * Refuses once any admin exists, so it cannot be used to escalate later.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!isAllowlistedAdmin(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, email: true },
    });

    if (existingAdmin) {
      if (existingAdmin.email === email) {
        return NextResponse.json({
          message: "You are already an admin",
          user: { email: existingAdmin.email, role: "ADMIN" },
        });
      }
      return NextResponse.json(
        { error: "An admin already exists. Cannot bootstrap." },
        { status: 409 }
      );
    }

    const updated = await prisma.user.update({
      where: { email },
      // Select explicitly — never return hashedPassword to a client.
      data: { role: "ADMIN" },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({
      message: "User promoted to admin",
      user: updated,
    });
  } catch (error) {
    console.error("[admin/bootstrap]", error);
    return NextResponse.json({ error: "Bootstrap failed" }, { status: 500 });
  }
}
