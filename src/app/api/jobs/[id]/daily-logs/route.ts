import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { id } = await params;

    // Verify job ownership
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const dailyLogs = await prisma.dailyLog.findMany({
      where: { jobId: id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(dailyLogs, { status: 200 });
  } catch (error) {
    console.error("Get daily logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily logs" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const data = await request.json();

    // Verify job ownership
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (!data.date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const dailyLog = await prisma.dailyLog.create({
      data: {
        jobId: id,
        date: new Date(data.date),
        notes: data.notes || null,
        hoursWorked: data.hoursWorked || 0,
        weather: data.weather || null,
        crewSize: data.crewSize || 0,
      },
    });

    return NextResponse.json(dailyLog, { status: 201 });
  } catch (error) {
    console.error("Create daily log error:", error);
    return NextResponse.json(
      { error: "Failed to create daily log" },
      { status: 500 }
    );
  }
}
