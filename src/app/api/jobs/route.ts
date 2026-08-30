import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const jobs = await prisma.job.findMany({
      where,
      include: { client: true, bid: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const data = await request.json();

    if (!data.jobName || !data.tradeType) {
      return NextResponse.json(
        { error: "jobName and tradeType are required" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        userId,
        jobName: data.jobName,
        description: data.description || null,
        tradeType: data.tradeType,
        clientId: data.clientId || null,
        bidId: data.bidId || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        status: data.status || "NOT_STARTED",
        startDate: data.startDate ? new Date(data.startDate) : null,
        expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : null,
        contractAmount: data.contractAmount || 0,
      },
      include: { client: true, bid: true },
    });

    await logActivity(userId, "job_created", { jobId: job.id, jobName: job.jobName });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
