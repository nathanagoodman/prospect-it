/**
 * Bid maths, shared by the create and update routes.
 *
 * The server always recomputes totals rather than trusting the numbers the
 * client sends, so a tampered request can't set its own price.
 */

export interface IncomingLineItem {
  category?: string;
  description?: string;
  qty?: number;
  quantity?: number;
  unitPrice?: number;
}

export interface NormalizedLineItem {
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/** Normalizes line items from the form into rows we can persist. */
export function normalizeLineItems(raw: unknown): NormalizedLineItem[] {
  if (!Array.isArray(raw)) return [];

  return (raw as IncomingLineItem[])
    .map((item) => {
      // The form sends `qty`; the schema column is `quantity`.
      const quantity = Number(item?.qty ?? item?.quantity ?? 0) || 0;
      const unitPrice = Number(item?.unitPrice ?? 0) || 0;
      return {
        category: String(item?.category ?? "Other").slice(0, 120),
        description: String(item?.description ?? "").slice(0, 500),
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      };
    })
    // Drop the blank placeholder rows the form starts with.
    .filter((li) => li.description.trim() !== "" || li.total > 0);
}

export function sumLineItems(items: { total: number }[]): number {
  return items.reduce((sum, li) => sum + li.total, 0);
}

export interface BidTotalsInput {
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  subcontractorCost: number;
  permitCost: number;
  overheadPercent: number;
  profitPercent: number;
  contingencyPercent: number;
  /** Sum of line item totals — for GCs this carries the sub bids. */
  lineItemsTotal?: number;
  /** GC-only project costs. */
  gcInsuranceCost?: number;
  gcPermitCost?: number;
  gcManagementPercent?: number;
}

export function calculateBidTotals(bidData: BidTotalsInput) {
  const subtotal =
    bidData.materialCost +
    bidData.laborCost +
    bidData.equipmentCost +
    bidData.subcontractorCost +
    bidData.permitCost +
    (bidData.lineItemsTotal ?? 0) +
    (bidData.gcInsuranceCost ?? 0) +
    (bidData.gcPermitCost ?? 0);

  const managementFee = subtotal * ((bidData.gcManagementPercent ?? 0) / 100);
  const overhead = subtotal * (bidData.overheadPercent / 100);
  const profit = subtotal * (bidData.profitPercent / 100);
  const contingency = subtotal * (bidData.contingencyPercent / 100);
  const totalBid = subtotal + managementFee + overhead + profit + contingency;

  // Management fee is GC revenue, so it counts toward margin alongside profit.
  const profitMargin =
    totalBid > 0 ? ((profit + managementFee) / totalBid) * 100 : 0;

  return {
    subtotal,
    overhead,
    profit,
    contingency,
    totalBid,
    profitMargin,
  };
}

// ─── Client-facing presentation ─────────────────────────────

export interface ClientBidLine {
  description: string;
  amount: number;
}

export interface BidForClientView {
  materialCost: number;
  laborCost: number;
  laborHours: number;
  equipmentCost: number;
  subcontractorCost: number;
  permitCost: number;
  totalBid: number;
  lineItems?: { description: string; category: string; quantity: number; unitPrice: number; total: number }[];
}

/**
 * Converts a bid into the line items a CUSTOMER should see.
 *
 * SECURITY-ADJACENT: overhead, profit, contingency, subtotal, and margin
 * must never reach the customer. Handing a client an itemized breakdown of
 * your markup costs contractors jobs. This function is the single place
 * that decides what's safe to show, so the PDF, the public share page, and
 * the invoice prefill can't drift apart on it.
 *
 * The markup is distributed proportionally across the real cost lines, so
 * the lines still sum to the quoted total but read as ordinary prices.
 */
export function toClientLineItems(bid: BidForClientView): ClientBidLine[] {
  // Build the base ADDITIVELY. calculateBidTotals sums direct costs AND
  // line items, so the customer view has to do the same. Treating line
  // items as the whole base (an earlier version of this) made every other
  // cost vanish and scaled a single item up to the entire bid total.
  const base: ClientBidLine[] = [];

  if (bid.materialCost > 0)
    base.push({ description: "Materials", amount: bid.materialCost });
  if (bid.laborCost > 0)
    // Deliberately no hour count: pairing hours with a marked-up labor
    // figure lets the customer divide out an implied rate.
    base.push({ description: "Labor", amount: bid.laborCost });
  if (bid.equipmentCost > 0)
    base.push({ description: "Equipment", amount: bid.equipmentCost });
  if (bid.subcontractorCost > 0)
    base.push({ description: "Subcontractor", amount: bid.subcontractorCost });
  if (bid.permitCost > 0)
    base.push({ description: "Permits & fees", amount: bid.permitCost });

  for (const li of bid.lineItems ?? []) {
    const amount = li.total || li.quantity * li.unitPrice;
    if (amount > 0) {
      base.push({
        description: li.description || li.category || "Work",
        amount,
      });
    }
  }

  const baseTotal = base.reduce((sum, l) => sum + l.amount, 0);
  if (baseTotal <= 0 || bid.totalBid <= 0) {
    // Nothing itemizable — show the total as a single line rather than
    // exposing an empty breakdown.
    return bid.totalBid > 0
      ? [{ description: "Scope of work as described", amount: bid.totalBid }]
      : [];
  }

  const markup = bid.totalBid / baseTotal;
  const scaled = base.map((l) => ({
    description: l.description,
    amount: Math.round(l.amount * markup * 100) / 100,
  }));

  // Absorb rounding drift into the last line so it sums exactly.
  const sum = scaled.reduce((s, l) => s + l.amount, 0);
  const drift = Math.round((bid.totalBid - sum) * 100) / 100;
  if (drift !== 0 && scaled.length > 0) {
    scaled[scaled.length - 1].amount =
      Math.round((scaled[scaled.length - 1].amount + drift) * 100) / 100;
  }

  return scaled;
}
