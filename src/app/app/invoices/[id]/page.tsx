"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: "ESTIMATE" | "INVOICE";
  status: string;
  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;
  clientCity: string | null;
  clientState: string | null;
  clientZip: string | null;
  clientPhone: string | null;
  projectName: string;
  projectDescription: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  terms: string | null;
  lineItems: LineItem[];
}

interface CompanyProfile {
  companyName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  licenseNumber: string | null;
  logoBase64: string | null;
  accentColor: string;
  footerText: string | null;
}

const statusColors: { [key: string]: string } = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, profRes] = await Promise.all([
          fetch(`/api/invoices/${id}`),
          fetch("/api/company-profile"),
        ]);
        if (invRes.ok) setInvoice(await invRes.json());
        if (profRes.ok) setProfile(await profRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!invoice) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoice(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      router.push("/app/invoices");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice || !profile) return;
    setDownloading(true);

    try {
      // Dynamic import for client-side only
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      const accent = profile.accentColor || "#f97316";
      const pageWidth = doc.internal.pageSize.getWidth();

      // Parse accent color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        } : { r: 249, g: 115, b: 22 };
      };
      const rgb = hexToRgb(accent);

      // ── TOP ACCENT BAR ──
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(0, 0, pageWidth, 4, "F");

      // ── LOGO / COMPANY NAME ──
      let yPos = 20;
      if (profile.logoBase64) {
        try {
          doc.addImage(profile.logoBase64, "PNG", 14, 14, 40, 20);
          yPos = 38;
        } catch {
          // fallback to text
          doc.setFontSize(18);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(profile.companyName || "Your Company", 14, 28);
          yPos = 34;
        }
      } else {
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(profile.companyName || "Your Company", 14, 28);
        yPos = 34;
      }

      // Company details
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const companyLines = [
        profile.address,
        [profile.city, profile.state, profile.zip].filter(Boolean).join(", "),
        profile.phone,
        profile.email,
        profile.website,
        profile.licenseNumber ? `License: ${profile.licenseNumber}` : null,
      ].filter(Boolean);
      companyLines.forEach((line, i) => {
        doc.text(line!, 14, yPos + i * 4);
      });

      // ── DOCUMENT TYPE + NUMBER (right side) ──
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      const typeLabel = invoice.type === "ESTIMATE" ? "ESTIMATE" : "INVOICE";
      doc.text(typeLabel, pageWidth - 14, 28, { align: "right" });

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`#${invoice.invoiceNumber}`, pageWidth - 14, 35, { align: "right" });

      doc.setFontSize(9);
      doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, pageWidth - 14, 42, { align: "right" });
      if (invoice.dueDate) {
        doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - 14, 47, { align: "right" });
      }

      // ── DIVIDER ──
      const dividerY = yPos + companyLines.length * 4 + 8;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, dividerY, pageWidth - 14, dividerY);

      // ── BILL TO ──
      let billY = dividerY + 10;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text("BILL TO", 14, billY);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(invoice.clientName, 14, billY + 6);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const clientLines = [
        invoice.clientAddress,
        [invoice.clientCity, invoice.clientState, invoice.clientZip].filter(Boolean).join(", "),
        invoice.clientPhone,
        invoice.clientEmail,
      ].filter(Boolean);
      clientLines.forEach((line, i) => {
        doc.text(line!, 14, billY + 11 + i * 4);
      });

      // ── PROJECT ──
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text("PROJECT", pageWidth / 2, billY);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(invoice.projectName, pageWidth / 2, billY + 6);

      if (invoice.projectDescription) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const descLines = doc.splitTextToSize(invoice.projectDescription, pageWidth / 2 - 28);
        doc.text(descLines, pageWidth / 2, billY + 11);
      }

      // ── LINE ITEMS TABLE ──
      const tableStartY = billY + 11 + Math.max(clientLines.length, 2) * 4 + 12;

      autoTable(doc, {
        startY: tableStartY,
        head: [["Description", "Qty", "Unit Price", "Total"]],
        body: invoice.lineItems.map((item) => [
          item.description,
          item.quantity.toString(),
          fmt(item.unitPrice),
          fmt(item.total),
        ]),
        headStyles: {
          fillColor: [rgb.r, rgb.g, rgb.b],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          cellPadding: 5,
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 5,
          textColor: [30, 41, 59],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 35, halign: "right" },
        },
        margin: { left: 14, right: 14 },
        theme: "plain",
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.25,
      });

      // ── TOTALS ──
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const totalsX = pageWidth - 14;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);

      let totalsY = finalY;
      doc.text("Subtotal:", totalsX - 45, totalsY);
      doc.setTextColor(15, 23, 42);
      doc.text(fmt(invoice.subtotal), totalsX, totalsY, { align: "right" });
      totalsY += 6;

      if (invoice.taxRate > 0) {
        doc.setTextColor(100, 116, 139);
        doc.text(`Tax (${invoice.taxRate}%):`, totalsX - 45, totalsY);
        doc.setTextColor(15, 23, 42);
        doc.text(fmt(invoice.taxAmount), totalsX, totalsY, { align: "right" });
        totalsY += 6;
      }

      if (invoice.discount > 0) {
        doc.setTextColor(100, 116, 139);
        doc.text("Discount:", totalsX - 45, totalsY);
        doc.setTextColor(220, 38, 38);
        doc.text(`-${fmt(invoice.discount)}`, totalsX, totalsY, { align: "right" });
        totalsY += 6;
      }

      // Total box
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.roundedRect(totalsX - 80, totalsY, 80, 12, 2, 2, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("TOTAL", totalsX - 75, totalsY + 8);
      doc.text(fmt(invoice.total), totalsX - 5, totalsY + 8, { align: "right" });

      // ── NOTES & TERMS ──
      let bottomY = totalsY + 22;

      if (invoice.notes) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.text("NOTES", 14, bottomY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const noteLines = doc.splitTextToSize(invoice.notes, pageWidth / 2 - 28);
        doc.text(noteLines, 14, bottomY + 5);
        bottomY += 5 + noteLines.length * 4 + 6;
      }

      if (invoice.terms) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.text("TERMS & CONDITIONS", 14, bottomY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const termLines = doc.splitTextToSize(invoice.terms, pageWidth - 28);
        doc.text(termLines, 14, bottomY + 5);
        bottomY += 5 + termLines.length * 4 + 6;
      }

      // ── FOOTER ──
      if (profile.footerText) {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(226, 232, 240);
        doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text(profile.footerText, pageWidth / 2, pageHeight - 12, { align: "center" });
      }

      // ── BOTTOM ACCENT BAR ──
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(0, pageHeight - 4, pageWidth, 4, "F");

      doc.save(`${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="text-center text-slate-500">Document not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => router.push("/app/invoices")} className="text-sm text-slate-500 hover:text-slate-900 font-medium mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            All Documents
          </button>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{invoice.invoiceNumber}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.type === "ESTIMATE" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
              {invoice.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[invoice.status] || "bg-slate-100 text-slate-700"}`}>
              {invoice.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {downloading ? "Generating..." : "Download PDF"}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Accent bar */}
            <div className="h-1.5" style={{ backgroundColor: profile?.accentColor || "#f97316" }} />
            <div className="p-8">
              {/* Header row */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  {profile?.logoBase64 ? (
                    <img src={profile.logoBase64} alt="Logo" className="h-12 object-contain mb-2" />
                  ) : null}
                  <h2 className="text-lg font-bold text-slate-900">{profile?.companyName || "Your Company"}</h2>
                  <div className="text-sm text-slate-500 space-y-0.5">
                    {profile?.address && <p>{profile.address}</p>}
                    <p>{[profile?.city, profile?.state, profile?.zip].filter(Boolean).join(", ")}</p>
                    {profile?.phone && <p>{profile.phone}</p>}
                    {profile?.email && <p>{profile.email}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-black" style={{ color: profile?.accentColor || "#f97316" }}>
                    {invoice.type}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">#{invoice.invoiceNumber}</p>
                  <p className="text-sm text-slate-500">Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
                  {invoice.dueDate && <p className="text-sm text-slate-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>}
                </div>
              </div>

              {/* Bill to / Project */}
              <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: profile?.accentColor || "#f97316" }}>Bill To</p>
                  <p className="font-bold text-slate-900">{invoice.clientName}</p>
                  <div className="text-sm text-slate-500 space-y-0.5">
                    {invoice.clientAddress && <p>{invoice.clientAddress}</p>}
                    <p>{[invoice.clientCity, invoice.clientState, invoice.clientZip].filter(Boolean).join(", ")}</p>
                    {invoice.clientPhone && <p>{invoice.clientPhone}</p>}
                    {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: profile?.accentColor || "#f97316" }}>Project</p>
                  <p className="font-bold text-slate-900">{invoice.projectName}</p>
                  {invoice.projectDescription && <p className="text-sm text-slate-500 mt-1">{invoice.projectDescription}</p>}
                </div>
              </div>

              {/* Line items */}
              <table className="w-full mb-6">
                <thead>
                  <tr style={{ backgroundColor: profile?.accentColor || "#f97316" }}>
                    <th className="text-left p-3 text-white text-sm font-bold rounded-tl-lg">Description</th>
                    <th className="text-center p-3 text-white text-sm font-bold w-20">Qty</th>
                    <th className="text-right p-3 text-white text-sm font-bold w-28">Unit Price</th>
                    <th className="text-right p-3 text-white text-sm font-bold w-28 rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="p-3 text-sm text-slate-700">{item.description}</td>
                      <td className="p-3 text-sm text-slate-700 text-center">{item.quantity}</td>
                      <td className="p-3 text-sm text-slate-700 text-right">{fmt(item.unitPrice)}</td>
                      <td className="p-3 text-sm font-semibold text-slate-900 text-right">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-900">{fmt(invoice.subtotal)}</span>
                  </div>
                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tax ({invoice.taxRate}%)</span>
                      <span className="font-semibold text-slate-900">{fmt(invoice.taxAmount)}</span>
                    </div>
                  )}
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Discount</span>
                      <span className="font-semibold text-red-600">-{fmt(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-xl font-black text-slate-900">{fmt(invoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {(invoice.notes || invoice.terms) && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  {invoice.notes && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: profile?.accentColor || "#f97316" }}>Notes</p>
                      <p className="text-sm text-slate-600">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: profile?.accentColor || "#f97316" }}>Terms & Conditions</p>
                      <p className="text-sm text-slate-600">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              {profile?.footerText && (
                <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400">{profile.footerText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black tracking-tight text-slate-900 mb-4">Update Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {["DRAFT", "SENT", "ACCEPTED", "PAID", "OVERDUE", "CANCELLED"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleUpdateStatus(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    invoice.status === s
                      ? "ring-2 ring-slate-900 " + (statusColors[s] || "bg-slate-100 text-slate-700")
                      : (statusColors[s] || "bg-slate-100 text-slate-700") + " opacity-60 hover:opacity-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black tracking-tight text-slate-900 mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Client</p>
                <p className="font-semibold text-slate-900">{invoice.clientName}</p>
              </div>
              <div>
                <p className="text-slate-500">Project</p>
                <p className="font-semibold text-slate-900">{invoice.projectName}</p>
              </div>
              <div>
                <p className="text-slate-500">Created</p>
                <p className="font-semibold text-slate-900">{new Date(invoice.issueDate).toLocaleDateString()}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <p className="text-slate-500">Due Date</p>
                  <p className="font-semibold text-slate-900">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-slate-500">Total</p>
                <p className="text-2xl font-black text-slate-900">{fmt(invoice.total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
