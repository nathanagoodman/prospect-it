import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWLIST = ["nathanagoodman@gmail.com"];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if email is in allowlist
    if (!ALLOWLIST.includes(session.user.email)) {
      return NextResponse.json(
        { error: "Email not authorized for admin bootstrap" },
        { status: 403 }
      );
    }

    // Check if any admins already exist
    const existingAdmins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    if (existingAdmins.length > 0) {
      return NextResponse.json(
        { error: "An admin already exists. Cannot bootstrap." },
        { status: 409 }
      );
    }

    // Make current user an admin
    const userId = (session.user as any).id;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    });

    return NextResponse.json(
      { message: "User promoted to admin", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin bootstrap error:", error);
    return NextResponse.json(
      { error: "Failed to bootstrap admin" },
      { status: 500 }
    );
  }
}
