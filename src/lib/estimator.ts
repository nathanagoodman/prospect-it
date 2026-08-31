import { type TradeType } from "./trades";

/**
 * Turns trade-specific takeoff quantities into a suggested material cost
 * and labor hours.
 *
 * ─── Design rules, in order of importance ──────────────────────────────
 *
 * 1. NEVER overwrite what the contractor typed. This module returns a
 *    suggestion. The UI presents it with an explicit "Apply" action. A
 *    tool that silently changes a bidder's numbers will be abandoned the
 *    first time it's wrong, and it will be wrong sometimes.
 *
 * 2. ALWAYS show the derivation. Every suggestion carries a line-by-line
 *    breakdown ("14 circuits × $75 = $1,050"). A contractor who can see
 *    the arithmetic can correct it. A black box gets no trust.
 *
 * 3. BE HONEST ABOUT THE NUMBERS. The rates below are generic starting
 *    points, not researched regional market data. They are the right
 *    order of magnitude for typical work and nothing more. Material
 *    prices move, labor productivity varies enormously by crew and
 *    market, and every one of these should be replaced by the user's own
 *    figures. The UI says this plainly — it must keep saying it.
 *
 * 4. Labor is returned as HOURS, never dollars, so it is always priced at
 *    the user's own labor rate rather than an assumed one.
 */

export interface UnitBasis {
  /** Estimated material dollars per unit of this metric. */
  material: number;
  /** Estimated labor hours per unit of this metric. */
  laborHours: number;
  /** Short explanation shown in the breakdown. */
  note?: string;
}

export interface TradeBasis {
  /** Metrics that scale cost directly: quantity × rate. */
  units: Record<string, UnitBasis>;
  /**
   * Metrics that scale the whole estimate rather than adding to it —
   * e.g. paint coats, drywall finish level, roof tear-off layers.
   */
  multipliers?: Record<
    string,
    {
      /** Applied to material, labor, or both. */
      applies: "material" | "labor" | "both";
      /**
       * How `perUnit` combines with the value:
       *  - "scale":    factor = value × perUnit   (2 coats = 2× the work)
       *  - "additive": factor = 1 + value × perUnit  (2 tear-off layers add
       *    70% on top of the base install labor, they don't replace it)
       * Ignored when `table` is provided.
       */
      mode?: "scale" | "additive";
      perUnit?: number;
      table?: Record<string, number>;
      note?: string;
    }
  >;
}

/**
 * Generic starting rates. See rule 3 above — these are deliberately round
 * numbers, not false precision.
 */
export const COST_BASIS: Partial<Record<TradeType, TradeBasis>> = {
  electrical: {
    units: {
      circuitCount: { material: 75, laborHours: 1.5, note: "wire, breaker, device, rough + trim" },
      panelUpgrades: { material: 900, laborHours: 8, note: "panel, breakers, permit coordination" },
      wireFootage: { material: 0.9, laborHours: 0.012, note: "per foot of run" },
      fixtureCount: { material: 60, laborHours: 0.75, note: "fixture + trim-out labor" },
      conduitFootage: { material: 2.2, laborHours: 0.06, note: "per foot, EMT typical" },
    },
  },

  plumbing: {
    units: {
      fixturePoints: { material: 220, laborHours: 3, note: "fixture, supply, waste, trim" },
      pipeFootage: { material: 4.5, laborHours: 0.09, note: "per foot, PEX/copper mix" },
      drainPoints: { material: 130, laborHours: 2.5, note: "DWV rough per point" },
      waterHeaters: { material: 1200, laborHours: 6, note: "unit, venting, connections" },
      gasLines: { material: 18, laborHours: 0.35, note: "per foot, black iron" },
    },
  },

  hvac: {
    units: {
      tonnage: { material: 1400, laborHours: 6, note: "equipment per ton installed" },
      ductFootage: { material: 14, laborHours: 0.2, note: "per foot of trunk/branch" },
      ventCount: { material: 45, laborHours: 0.8, note: "register or return" },
      unitCount: { material: 600, laborHours: 4, note: "air handler / condenser set" },
      refrigerantLines: { material: 12, laborHours: 0.15, note: "per foot of lineset" },
    },
  },

  roofing: {
    units: {
      roofSquares: { material: 190, laborHours: 2.5, note: "shingles, felt, nails per square" },
      ridgeLinearFt: { material: 5.5, laborHours: 0.06, note: "ridge cap and vent" },
      flashingPoints: { material: 45, laborHours: 1.2, note: "per penetration or valley" },
      dumpsterLoads: { material: 550, laborHours: 0, note: "haul and tipping fee" },
    },
    multipliers: {
      tearOffLayers: {
        applies: "labor",
        mode: "additive",
        perUnit: 0.35,
        note: "each existing layer adds tear-off labor on top of install",
      },
    },
  },

  concrete: {
    units: {
      cubicYards: { material: 165, laborHours: 1.2, note: "delivered mix per yard" },
      slabSqFt: { material: 0.8, laborHours: 0.03, note: "vapor barrier, finish per sq ft" },
      rebarTons: { material: 1400, laborHours: 22, note: "steel plus tie labor" },
      formworkLinearFt: { material: 9, laborHours: 0.3, note: "form material and set" },
      pumpHours: { material: 250, laborHours: 0, note: "pump truck and operator" },
    },
  },

  framing: {
    units: {
      boardFeet: { material: 1.35, laborHours: 0.012, note: "lumber per board foot" },
      wallLinearFt: { material: 12, laborHours: 0.35, note: "plate, studs, blocking" },
      trusses: { material: 190, laborHours: 0.9, note: "truss plus set labor" },
      sheathingSheets: { material: 34, laborHours: 0.3, note: "per sheet installed" },
      headerCount: { material: 55, laborHours: 0.8, note: "header material and set" },
    },
  },

  drywall: {
    units: {
      drywallSheets: { material: 16, laborHours: 0.7, note: "board, hang and fasten" },
      drywallSqFt: { material: 0.12, laborHours: 0.011, note: "mud, tape, sand per sq ft" },
      cornerBeadFt: { material: 1.1, laborHours: 0.045, note: "bead and finish" },
    },
    multipliers: {
      finishLevel: {
        applies: "labor",
        table: { "1": 0.5, "2": 0.7, "3": 1, "4": 1.25, "5": 1.7 },
        note: "finish level drives coats and sanding",
      },
    },
  },

  painting: {
    units: {
      paintSqFt: { material: 0.18, laborHours: 0.011, note: "per sq ft, per coat" },
      gallons: { material: 48, laborHours: 0, note: "material only" },
      prepHours: { material: 0, laborHours: 1, note: "entered directly as hours" },
    },
    multipliers: {
      coats: {
        applies: "both",
        mode: "scale",
        perUnit: 1,
        note: "each coat repeats material and application",
      },
    },
  },

  flooring: {
    units: {
      floorSqFt: { material: 4.5, laborHours: 0.045, note: "material and install per sq ft" },
      underlaymentSqFt: { material: 0.65, laborHours: 0.008, note: "underlayment per sq ft" },
      transitionStrips: { material: 28, laborHours: 0.4, note: "per transition" },
      stairCount: { material: 45, laborHours: 0.9, note: "per tread and riser" },
    },
  },

  masonry: {
    units: {
      blockCount: { material: 3.2, laborHours: 0.13, note: "unit, mortar share, lay labor" },
      wallSqFt: { material: 1.1, laborHours: 0.05, note: "ties, reinforcement, cleaning" },
      mortarBags: { material: 9, laborHours: 0.1, note: "mix per bag" },
      scaffoldDays: { material: 140, laborHours: 1.5, note: "rental plus erect/strike share" },
    },
  },

  welding: {
    units: {
      weldInches: { material: 1.4, laborHours: 0.06, note: "consumables and arc time" },
      steelTons: { material: 1600, laborHours: 16, note: "material plus fit-up" },
      jointsCount: { material: 12, laborHours: 0.5, note: "per joint prepared and welded" },
    },
  },

  demolition: {
    units: {
      demoSqFt: { material: 0.15, laborHours: 0.02, note: "protection and consumables" },
      demoHaulLoads: { material: 600, laborHours: 2, note: "haul, tipping, load time" },
    },
  },

  excavation: {
    units: {
      excavationCuYd: { material: 0, laborHours: 0.06, note: "machine time per yard" },
      trenchLinearFt: { material: 1.2, laborHours: 0.05, note: "bedding and backfill" },
      fillDirtLoads: { material: 350, laborHours: 1, note: "imported fill per load" },
      gradeAcres: { material: 0, laborHours: 12, note: "rough grade per acre" },
    },
  },

  insulation: {
    units: {
      insulationSqFt: { material: 0.85, laborHours: 0.008, note: "batt or blown per sq ft" },
      sprayFoamSqFt: { material: 2.1, laborHours: 0.012, note: "closed cell per sq ft" },
    },
  },

  landscaping: {
    units: {
      lotSqFt: { material: 0.35, laborHours: 0.006, note: "soil prep per sq ft" },
      sodPallets: { material: 210, laborHours: 3, note: "pallet plus lay labor" },
      treesAndShrubs: { material: 85, laborHours: 0.75, note: "plant plus install" },
      mulchYards: { material: 42, laborHours: 1, note: "material and spread" },
      irrigationZones: { material: 320, laborHours: 4, note: "heads, valve, trenching" },
    },
  },
};

export interface EstimateLine {
  metricKey: string;
  label: string;
  quantity: number;
  unit: string;
  materialRate: number;
  laborRate: number;
  material: number;
  laborHours: number;
  note?: string;
}

export interface EstimateResult {
  /** True when the trade has a basis and the user entered usable quantities. */
  available: boolean;
  materialCost: number;
  laborHours: number;
  lines: EstimateLine[];
  /** Human-readable notes about multipliers that were applied. */
  adjustments: string[];
}

const EMPTY: EstimateResult = {
  available: false,
  materialCost: 0,
  laborHours: 0,
  lines: [],
  adjustments: [],
};

/**
 * Produces a suggested material cost and labor hour count from the
 * trade metrics the user has entered.
 *
 * Returns `available: false` when there's nothing meaningful to suggest,
 * so the UI can stay quiet rather than showing a confident $0.
 */
export function estimateFromMetrics(
  tradeType: string,
  metrics: Record<string, number | string | undefined | null>,
  metricLabels: Record<string, { label: string; unit: string }> = {}
): EstimateResult {
  const basis = COST_BASIS[tradeType as TradeType];
  if (!basis) return EMPTY;

  const lines: EstimateLine[] = [];
  let material = 0;
  let laborHours = 0;

  for (const [key, unitBasis] of Object.entries(basis.units)) {
    const raw = metrics?.[key];
    const quantity = Number(raw) || 0;
    if (quantity <= 0) continue;

    const lineMaterial = quantity * unitBasis.material;
    const lineHours = quantity * unitBasis.laborHours;

    material += lineMaterial;
    laborHours += lineHours;

    lines.push({
      metricKey: key,
      label: metricLabels[key]?.label ?? key,
      quantity,
      unit: metricLabels[key]?.unit ?? "",
      materialRate: unitBasis.material,
      laborRate: unitBasis.laborHours,
      material: lineMaterial,
      laborHours: lineHours,
      note: unitBasis.note,
    });
  }

  if (lines.length === 0) return EMPTY;

  // Apply multipliers (coats, finish level, tear-off layers…)
  const adjustments: string[] = [];
  for (const [key, mult] of Object.entries(basis.multipliers ?? {})) {
    const raw = metrics?.[key];
    if (raw === undefined || raw === null || raw === "") continue;

    let factor: number | undefined;
    if (mult.table) {
      factor = mult.table[String(raw)];
    } else if (mult.perUnit !== undefined) {
      const n = Number(raw) || 0;
      if (n > 0) {
        factor =
          mult.mode === "additive" ? 1 + n * mult.perUnit : n * mult.perUnit;
      }
    }

    if (factor === undefined || factor <= 0 || factor === 1) continue;

    if (mult.applies === "material" || mult.applies === "both") material *= factor;
    if (mult.applies === "labor" || mult.applies === "both") laborHours *= factor;

    const label = metricLabels[key]?.label ?? key;
    adjustments.push(
      `${label} = ${raw} → ×${factor.toFixed(2)} on ${mult.applies}${
        mult.note ? ` (${mult.note})` : ""
      }`
    );
  }

  return {
    available: true,
    materialCost: Math.round(material * 100) / 100,
    laborHours: Math.round(laborHours * 10) / 10,
    lines,
    adjustments,
  };
}

/** Whether a trade has any cost basis at all. */
export function hasCostBasis(tradeType: string): boolean {
  return Boolean(COST_BASIS[tradeType as TradeType]);
}
