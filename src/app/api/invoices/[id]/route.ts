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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: true, bid: true, client: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (invoice.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Get invoice error:", error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const data = await request.json();

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Recalculate totals if line items provided
    let subtotal = existing.subtotal;
    let taxAmount = existing.taxAmount;
    let total = existing.total;

    if (data.lineItems) {
      subtotal = data.lineItems.reduce(
        (sum: number, item: any) => sum + (item.quantity || 1) * (item.unitPrice || 0),
        0
      );
      const taxRate = data.taxRate ?? existing.taxRate;
      const discount = data.discount ?? existing.discount;
      taxAmount = subtotal * (taxRate / 100);
      total = subtotal + taxAmount - discount;

      // Delete old line items and recreate
      await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
      await prisma.invoiceLineItem.createMany({
        data: data.lineItems.map((item: any) => ({
          invoiceId: id,
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          total: (item.quantity || 1) * (item.unitPrice || 0),
        })),
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: data.status ?? existing.status,
        clientName: data.clientName ?? existing.clientName,
        clientEmail: data.clientEmail ?? existing.clientEmail,
        clientAddress: data.clientAddress ?? existing.clientAddress,
        clientCity: data.clientCity ?? existing.clientCity,
        clientState: data.clientState ?? existing.clientState,
        clientZip: data.clientZip ?? existing.clientZip,
        clientPhone: data.clientPhone ?? existing.clientPhone,
        projectName: data.projectName ?? existing.projectName,
        projectDescription: data.projectDescription ?? existing.projectDescription,
        subtotal,
        taxRate: data.taxRate ?? existing.taxRate,
        taxAmount,
        discount: data.discount ?? existing.discount,
        total,
        dueDate: data.dueDate ? new Date(data.dueDate) : existing.dueDate,
        notes: data.notes ?? existing.notes,
        terms: data.terms ?? existing.terms,
      },
      include: { lineItems: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (invoice.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
