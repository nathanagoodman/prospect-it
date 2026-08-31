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
