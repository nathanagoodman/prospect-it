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

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        bid: true,
        changeOrders: true,
        dailyLogs: true,
      },
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

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Verify ownership
    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (existingJob.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        jobName: data.jobName ?? existingJob.jobName,
        description: data.description ?? existingJob.description,
        tradeType: data.tradeType ?? existingJob.tradeType,
        clientId: data.clientId ?? existingJob.clientId,
        address: data.address ?? existingJob.address,
        city: data.city ?? existingJob.city,
        state: data.state ?? existingJob.state,
        zip: data.zip ?? existingJob.zip,
        status: data.status ?? existingJob.status,
        startDate: data.startDate ? new Date(data.startDate) : existingJob.startDate,
        expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : existingJob.expectedEndDate,
        actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : existingJob.actualEndDate,
        contractAmount: data.contractAmount ?? existingJob.contractAmount,
        totalCosts: data.totalCosts ?? existingJob.totalCosts,
        totalBilled: data.totalBilled ?? existingJob.totalBilled,
        totalPaid: data.totalPaid ?? existingJob.totalPaid,
      },
      include: {
        client: true,
        bid: true,
        changeOrders: true,
        dailyLogs: true,
      },
    });

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify ownership
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

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
