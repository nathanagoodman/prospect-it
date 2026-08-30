import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: { lineItems: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await request.json();

    // Generate invoice number
    const count = await prisma.invoice.count({ where: { userId } });
    const prefix = data.type === "INVOICE" ? "INV" : "EST";
    const invoiceNumber = `${prefix}-${String(count + 1).padStart(4, "0")}`;

    // Calculate totals from line items
    const lineItems = data.lineItems || [];
    const subtotal = lineItems.reduce(
      (sum: number, item: any) => sum + (item.quantity || 1) * (item.unitPrice || 0),
      0
    );
    const taxAmount = subtotal * ((data.taxRate || 0) / 100);
    const discount = data.discount || 0;
    const total = subtotal + taxAmount - discount;

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        bidId: data.bidId || null,
        clientId: data.clientId || null,
        invoiceNumber,
        type: data.type || "ESTIMATE",
        status: data.status || "DRAFT",
        clientName: data.clientName || "",
        clientEmail: data.clientEmail || null,
        clientAddress: data.clientAddress || null,
        clientCity: data.clientCity || null,
        clientState: data.clientState || null,
        clientZip: data.clientZip || null,
        clientPhone: data.clientPhone || null,
        projectName: data.projectName || "",
        projectDescription: data.projectDescription || null,
        subtotal,
        taxRate: data.taxRate || 0,
        taxAmount,
        discount,
        total,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || null,
        terms: data.terms || null,
        lineItems: {
          create: lineItems.map((item: any) => ({
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            total: (item.quantity || 1) * (item.unitPrice || 0),
          })),
        },
      },
      include: { lineItems: true },
    });

    await logActivity(userId, "invoice_created", { invoiceId: invoice.id });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
