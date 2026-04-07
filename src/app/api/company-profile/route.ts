import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    let profile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    // Auto-create profile from user data if it doesn't exist
    if (!profile) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      profile = await prisma.companyProfile.create({
        data: {
          userId,
          companyName: user?.company || "",
          phone: user?.phone || "",
          email: user?.email || "",
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Get company profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await request.json();

    const updateData: any = {};
    const fields = [
      "companyName", "address", "city", "state", "zip",
      "phone", "email", "website", "licenseNumber",
      "logoBase64", "accentColor", "paymentTerms",
      "defaultNotes", "footerText",
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const profile = await prisma.companyProfile.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Update company profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
