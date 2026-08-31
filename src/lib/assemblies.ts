import type { TradeType } from "./trades";

/**
 * Assembly-based estimating.
 *
 * ─── Why this exists ───────────────────────────────────────────────────
 *
 * Contractors don't estimate in aggregate quantities. They count things
 * they can see: "22 duplex receptacles, 8 can lights, 3 three-way
 * switches, one 200A panel." Each of those is an ASSEMBLY — a named unit
 * of work bundling every material it consumes plus the labor to install
 * it. A duplex receptacle assembly isn't a wire cost; it's the box,
 * plaster ring, device, plate, pigtail, wire nuts, connectors, and the
 * ~half hour to install them.
 *
 * This is how the estimating books and the good spreadsheets work, and
 * it's meaningfully more accurate than quantity × flat rate. Our earlier
 * model priced every plumbing "fixture point" at 3 labor hours — but a
 * toilet is roughly 2.5-4 hours and a tub/shower is 4.5-7. Counting
 * fixtures without distinguishing type under-bids bathroom-heavy jobs.
 *
 * ─── On the numbers ────────────────────────────────────────────────────
 *
 * These are GENERIC STARTING VALUES, not industry-standard data.
 *
 * The published labor-unit references (NECA's Manual of Labor Units,
 * PHCC's tables) are copyrighted and are not reproduced here. Where a
 * public range was available it informed the value chosen — plumbing
 * fixture hours in particular — but every figure below is a rough,
 * editable starting point, not a citation.
 *
 * Material prices move constantly and labor productivity varies enormously
 * by crew, market, and site conditions. The intended end state is that
 * each contractor replaces these with their own rate card. Until they do,
 * the UI must keep saying plainly that these are placeholders.
 */

export interface Assembly {
  id: string;
  trade: TradeType;
  /** What the contractor counts, in their language. */
  name: string;
  /** The unit being counted — "each", "sq ft", "linear ft". */
  unit: string;
  /** Grouping for the picker. */
  category: string;
  /** Generic starting material cost per unit, in dollars. */
  material: number;
  /** Generic starting labor hours per unit. */
  laborHours: number;
  /** What the assembly is assumed to include. Shown in the UI. */
  includes: string;
}

export const ASSEMBLIES: Assembly[] = [
  // ─── ELECTRICAL ──────────────────────────────────────────────────────
  {
    id: "elec-recep",
    trade: "electrical",
    name: "Duplex receptacle",
    unit: "each",
    category: "Devices",
    material: 22,
    laborHours: 0.5,
    includes: "Box, plaster ring, device, plate, pigtail, wire nuts, connectors",
  },
  {
    id: "elec-gfci",
    trade: "electrical",
    name: "GFCI receptacle",
    unit: "each",
    category: "Devices",
    material: 38,
    laborHours: 0.6,
    includes: "Box, ring, GFCI device, plate, terminations",
  },
  {
    id: "elec-switch-single",
    trade: "electrical",
    name: "Single-pole switch",
    unit: "each",
    category: "Devices",
    material: 18,
    laborHours: 0.45,
    includes: "Box, ring, switch, plate, terminations",
  },
  {
    id: "elec-switch-3way",
    trade: "electrical",
    name: "Three-way switch",
    unit: "each",
    category: "Devices",
    material: 28,
    laborHours: 0.7,
    includes: "Box, ring, 3-way device, plate, traveler terminations",
  },
  {
    id: "elec-can-light",
    trade: "electrical",
    name: "Recessed can light",
    unit: "each",
    category: "Lighting",
    material: 48,
    laborHours: 0.8,
    includes: "Housing, trim, lamp, rough-in and trim-out labor",
  },
  {
    id: "elec-fixture-surface",
    trade: "electrical",
    name: "Surface light fixture",
    unit: "each",
    category: "Lighting",
    material: 55,
    laborHours: 0.6,
    includes: "Box, fixture allowance, mounting, terminations",
  },
  {
    id: "elec-circuit-20a",
    trade: "electrical",
    name: "20A branch circuit home run",
    unit: "each",
    category: "Circuits",
    material: 65,
    laborHours: 1.2,
    includes: "Breaker, ~50 ft 12/2, staples, panel termination",
  },
  {
    id: "elec-circuit-240",
    trade: "electrical",
    name: "240V appliance circuit",
    unit: "each",
    category: "Circuits",
    material: 145,
    laborHours: 2.2,
    includes: "2-pole breaker, heavier conductor, receptacle or whip",
  },
  {
    id: "elec-panel-200",
    trade: "electrical",
    name: "200A panel / service upgrade",
    unit: "each",
    category: "Service",
    material: 950,
    laborHours: 9,
    includes: "Panel, main breaker, grounding, utility coordination, permit time",
  },
  {
    id: "elec-subpanel",
    trade: "electrical",
    name: "Sub-panel",
    unit: "each",
    category: "Service",
    material: 380,
    laborHours: 5,
    includes: "Panel, feeder breaker, grounding, mounting",
  },
  {
    id: "elec-ceiling-fan",
    trade: "electrical",
    name: "Ceiling fan (braced box)",
    unit: "each",
    category: "Lighting",
    material: 42,
    laborHours: 1.1,
    includes: "Fan-rated braced box, switch leg, assembly and hanging",
  },
  {
    id: "elec-smoke",
    trade: "electrical",
    name: "Smoke / CO detector",
    unit: "each",
    category: "Devices",
    material: 45,
    laborHours: 0.6,
    includes: "Device, box, interconnect wiring",
  },

  // ─── PLUMBING ────────────────────────────────────────────────────────
  // Fixture hours reflect the wide public ranges: a toilet is roughly
  // 2.5-4 hours and a tub/shower 4.5-7, which is exactly why a single
  // blended "fixture point" mis-prices bathroom-heavy work.
  {
    id: "plumb-toilet",
    trade: "plumbing",
    name: "Toilet (set + trim)",
    unit: "each",
    category: "Fixtures — trim",
    material: 320,
    laborHours: 2.2,
    includes: "Fixture allowance, flange, bolts, supply, set and test. Rough-in priced separately.",
  },
  {
    id: "plumb-tub-shower",
    trade: "plumbing",
    name: "Tub / shower (set + trim)",
    unit: "each",
    category: "Fixtures — trim",
    material: 640,
    laborHours: 4,
    includes: "Unit allowance, valve, waste and overflow, trim out. Rough-in priced separately.",
  },
  {
    id: "plumb-lav",
    trade: "plumbing",
    name: "Lavatory sink (set + trim)",
    unit: "each",
    category: "Fixtures — trim",
    material: 260,
    laborHours: 1.8,
    includes: "Fixture and faucet allowance, stops, trap, set and test. Rough-in priced separately.",
  },
  {
    id: "plumb-kitchen-sink",
    trade: "plumbing",
    name: "Kitchen sink + disposal (set + trim)",
    unit: "each",
    category: "Fixtures — trim",
    material: 420,
    laborHours: 2.5,
    includes: "Sink and faucet allowance, disposal, trap, connections. Rough-in priced separately.",
  },
  {
    id: "plumb-water-heater",
    trade: "plumbing",
    name: "Water heater (swap)",
    unit: "each",
    category: "Equipment (includes rough)",
    material: 1150,
    laborHours: 4,
    includes: "Unit, connectors, T&P, venting, pan, haul-off",
  },
  {
    id: "plumb-tankless",
    trade: "plumbing",
    name: "Tankless water heater",
    unit: "each",
    category: "Equipment",
    material: 1900,
    laborHours: 7,
    includes: "Unit, gas upsize allowance, venting, isolation valves",
  },
  {
    id: "plumb-hosebib",
    trade: "plumbing",
    name: "Hose bib / exterior spigot",
    unit: "each",
    category: "Fixtures",
    material: 55,
    laborHours: 1.2,
    includes: "Frost-free bib, supply run, penetration, seal",
  },
  {
    id: "plumb-roughin-point",
    trade: "plumbing",
    name: "Rough-in point (supply + DWV)",
    unit: "each",
    category: "Fixtures — rough",
    material: 145,
    laborHours: 2.5,
    includes: "Supply, waste and vent to one fixture location. Add one per fixture on new work or a gut remodel.",
  },
  {
    id: "plumb-gas-run",
    trade: "plumbing",
    name: "Gas line run",
    unit: "linear ft",
    category: "Rough-in",
    material: 16,
    laborHours: 0.3,
    includes: "Black iron or CSST, fittings, support, pressure test share",
  },

  // ─── HVAC ────────────────────────────────────────────────────────────
  // Outdoor and indoor units are deliberately separate and
  // non-overlapping. An earlier version had a "split system per ton" that
  // bundled the indoor unit AND a separate furnace line — a contractor
  // selecting both double-counted the air handler and over-bid by
  // thousands.
  {
    id: "hvac-condenser",
    trade: "hvac",
    name: "Condenser / outdoor unit (per ton)",
    unit: "ton",
    category: "Equipment",
    material: 1050,
    laborHours: 2.2,
    includes: "Outdoor unit and coil share, pad, disconnect, whip, charge and startup",
  },
  {
    id: "hvac-furnace",
    trade: "hvac",
    name: "Furnace (gas)",
    unit: "each",
    category: "Equipment",
    material: 1650,
    laborHours: 6,
    includes: "Furnace, plenum transitions, flue, condensate, gas connection",
  },
  {
    id: "hvac-air-handler",
    trade: "hvac",
    name: "Air handler (electric)",
    unit: "each",
    category: "Equipment",
    material: 1250,
    laborHours: 5,
    includes: "Air handler, plenum transitions, condensate, electrical connection",
  },
  {
    id: "hvac-mini-split",
    trade: "hvac",
    name: "Ductless mini-split head",
    unit: "each",
    category: "Equipment",
    material: 1250,
    laborHours: 6,
    includes: "Head, lineset, wall penetration, condensate, charge",
  },
  {
    id: "hvac-supply-register",
    trade: "hvac",
    name: "Supply register + branch",
    unit: "each",
    category: "Distribution",
    material: 85,
    laborHours: 1.3,
    includes: "Register, flex branch, take-off, boot, sealing",
  },
  {
    id: "hvac-return",
    trade: "hvac",
    name: "Return air drop",
    unit: "each",
    category: "Distribution",
    material: 140,
    laborHours: 2,
    includes: "Grille, filter frame, return duct, transition",
  },
  {
    id: "hvac-trunk-duct",
    trade: "hvac",
    name: "Trunk duct",
    unit: "linear ft",
    category: "Distribution",
    material: 22,
    laborHours: 0.3,
    includes: "Sheet metal or duct board, hangers, sealing, insulation",
  },
  {
    id: "hvac-thermostat",
    trade: "hvac",
    name: "Thermostat",
    unit: "each",
    category: "Controls",
    material: 145,
    laborHours: 1,
    includes: "Stat, control wire, mounting, configuration",
  },
  {
    id: "hvac-lineset",
    trade: "hvac",
    name: "Refrigerant lineset",
    unit: "linear ft",
    category: "Equipment",
    material: 14,
    laborHours: 0.18,
    includes: "Insulated lineset, supports, brazing share",
  },

  // ─── DRYWALL ─────────────────────────────────────────────────────────
  {
    id: "dry-hang-finish",
    trade: "drywall",
    name: "Hang + finish (walls/ceilings)",
    unit: "sq ft",
    category: "Board",
    material: 0.65,
    laborHours: 0.022,
    includes: "Board, screws, tape, compound, hang and finish to level 4",
  },
  {
    id: "dry-corner-bead",
    trade: "drywall",
    name: "Corner bead",
    unit: "linear ft",
    category: "Detail",
    material: 1.15,
    laborHours: 0.05,
    includes: "Bead, fasteners, three-coat finish",
  },
  {
    id: "dry-ceiling-texture",
    trade: "drywall",
    name: "Ceiling texture",
    unit: "sq ft",
    category: "Finish",
    material: 0.15,
    laborHours: 0.008,
    includes: "Material, spray, masking share",
  },
  {
    id: "dry-patch",
    trade: "drywall",
    name: "Patch / repair",
    unit: "each",
    category: "Repair",
    material: 25,
    laborHours: 1.5,
    includes: "Cut, backing, board, three coats, sand, blend",
  },

  // ─── CONCRETE ────────────────────────────────────────────────────────
  {
    id: "conc-slab",
    trade: "concrete",
    name: "Slab on grade (4 in)",
    unit: "sq ft",
    category: "Flatwork",
    material: 6.5,
    laborHours: 0.055,
    includes: "Concrete, base, vapor barrier, mesh, place and broom finish",
  },
  {
    id: "conc-driveway",
    trade: "concrete",
    name: "Driveway / apron",
    unit: "sq ft",
    category: "Flatwork",
    material: 7.5,
    laborHours: 0.065,
    includes: "Thicker section, base, reinforcement, place and finish",
  },
  {
    id: "conc-footing",
    trade: "concrete",
    name: "Footing",
    unit: "linear ft",
    category: "Structural",
    material: 22,
    laborHours: 0.4,
    includes: "Excavate allowance, form, rebar, place",
  },
  {
    id: "conc-wall",
    trade: "concrete",
    name: "Foundation wall",
    unit: "sq ft",
    category: "Structural",
    material: 18,
    laborHours: 0.28,
    includes: "Forms, rebar, place, strip, patch",
  },
  {
    id: "conc-sidewalk",
    trade: "concrete",
    name: "Sidewalk / walkway",
    unit: "sq ft",
    category: "Flatwork",
    material: 8,
    laborHours: 0.07,
    includes: "Base, forms, place, finish, control joints",
  },
  {
    id: "conc-pump",
    trade: "concrete",
    name: "Pump truck",
    unit: "hour",
    category: "Equipment",
    material: 260,
    laborHours: 0,
    includes: "Pump and operator, minimum hours typically apply",
  },

  // ─── FRAMING ─────────────────────────────────────────────────────────
  {
    id: "frame-wall",
    trade: "framing",
    name: "Exterior wall (framed)",
    unit: "linear ft",
    category: "Walls",
    material: 26,
    laborHours: 0.55,
    includes: "Plates, studs 16 OC, sheathing, blocking, fasteners",
  },
  {
    id: "frame-interior-wall",
    trade: "framing",
    name: "Interior partition",
    unit: "linear ft",
    category: "Walls",
    material: 14,
    laborHours: 0.35,
    includes: "Plates, studs, blocking, fasteners",
  },
  {
    id: "frame-truss-set",
    trade: "framing",
    name: "Roof truss (set)",
    unit: "each",
    category: "Roof",
    material: 185,
    laborHours: 0.85,
    includes: "Truss, bracing, hangers, set labor",
  },
  {
    id: "frame-floor-system",
    trade: "framing",
    name: "Floor system",
    unit: "sq ft",
    category: "Floor",
    material: 7.5,
    laborHours: 0.045,
    includes: "Joists, rim, hangers, subfloor, glue and fasteners",
  },
  {
    id: "frame-header",
    trade: "framing",
    name: "Header / opening",
    unit: "each",
    category: "Openings",
    material: 65,
    laborHours: 0.9,
    includes: "Header stock, jacks, kings, cripples, set",
  },

  // ─── ROOFING ─────────────────────────────────────────────────────────
  {
    id: "roof-arch-shingle",
    trade: "roofing",
    name: "Architectural shingles",
    unit: "square",
    category: "Roofing",
    material: 195,
    laborHours: 2.4,
    includes: "Shingles, underlayment, starter, nails, install",
  },
  {
    id: "roof-tearoff",
    trade: "roofing",
    name: "Tear-off (per layer)",
    unit: "square",
    category: "Demo",
    material: 22,
    laborHours: 0.9,
    includes: "Strip one layer, load out, disposal share",
  },
  {
    id: "roof-decking",
    trade: "roofing",
    name: "Decking replacement",
    unit: "sheet",
    category: "Structure",
    material: 42,
    laborHours: 0.5,
    includes: "Sheathing, fasteners, cut and fit",
  },
  {
    id: "roof-ridge-vent",
    trade: "roofing",
    name: "Ridge vent",
    unit: "linear ft",
    category: "Ventilation",
    material: 7,
    laborHours: 0.08,
    includes: "Vent, cut, cap shingles, fasteners",
  },
  {
    id: "roof-pipe-boot",
    trade: "roofing",
    name: "Pipe boot / penetration",
    unit: "each",
    category: "Flashing",
    material: 28,
    laborHours: 0.6,
    includes: "Boot, flashing, seal, shingle weave",
  },
  {
    id: "roof-valley",
    trade: "roofing",
    name: "Valley",
    unit: "linear ft",
    category: "Flashing",
    material: 9,
    laborHours: 0.14,
    includes: "Valley metal or ice shield, cut and weave",
  },

  // ─── PAINTING ────────────────────────────────────────────────────────
  {
    id: "paint-wall-2coat",
    trade: "painting",
    name: "Walls — two coats",
    unit: "sq ft",
    category: "Interior",
    material: 0.38,
    laborHours: 0.022,
    includes: "Primer as needed, two finish coats, cut and roll",
  },
  {
    id: "paint-ceiling",
    trade: "painting",
    name: "Ceiling",
    unit: "sq ft",
    category: "Interior",
    material: 0.32,
    laborHours: 0.02,
    includes: "One to two coats, cut and roll overhead",
  },
  {
    id: "paint-trim",
    trade: "painting",
    name: "Trim / baseboard",
    unit: "linear ft",
    category: "Interior",
    material: 0.55,
    laborHours: 0.06,
    includes: "Caulk, sand, prime as needed, finish coat",
  },
  {
    id: "paint-door",
    trade: "painting",
    name: "Door + casing",
    unit: "each",
    category: "Interior",
    material: 14,
    laborHours: 1.1,
    includes: "Both faces, edges, casing, hardware masking",
  },
  {
    id: "paint-prep",
    trade: "painting",
    name: "Surface prep",
    unit: "hour",
    category: "Prep",
    material: 6,
    laborHours: 1,
    includes: "Patch, sand, caulk, mask, protect",
  },

  // ─── FLOORING ────────────────────────────────────────────────────────
  {
    id: "floor-lvp",
    trade: "flooring",
    name: "Luxury vinyl plank",
    unit: "sq ft",
    category: "Material",
    material: 4.2,
    laborHours: 0.04,
    includes: "Plank, underlayment, transitions share, install",
  },
  {
    id: "floor-tile",
    trade: "flooring",
    name: "Tile (floor)",
    unit: "sq ft",
    category: "Material",
    material: 6.5,
    laborHours: 0.11,
    includes: "Tile, thinset, grout, backer, layout and set",
  },
  {
    id: "floor-hardwood",
    trade: "flooring",
    name: "Hardwood",
    unit: "sq ft",
    category: "Material",
    material: 8.5,
    laborHours: 0.07,
    includes: "Material, fasteners, underlayment, install",
  },
  {
    id: "floor-carpet",
    trade: "flooring",
    name: "Carpet + pad",
    unit: "sq ft",
    category: "Material",
    material: 3.4,
    laborHours: 0.025,
    includes: "Carpet, pad, tack strip, stretch and seam",
  },
  {
    id: "floor-demo",
    trade: "flooring",
    name: "Demo existing floor",
    unit: "sq ft",
    category: "Demo",
    material: 0.2,
    laborHours: 0.02,
    includes: "Remove, scrape, haul out",
  },
  {
    id: "floor-prep",
    trade: "flooring",
    name: "Subfloor prep / leveling",
    unit: "sq ft",
    category: "Prep",
    material: 1.1,
    laborHours: 0.03,
    includes: "Leveler, patch, sand, moisture check",
  },
];

/** Assemblies available for a trade, grouped for the picker. */
export function assembliesForTrade(trade: string): Assembly[] {
  return ASSEMBLIES.filter((a) => a.trade === trade);
}

export function hasAssemblies(trade: string): boolean {
  return ASSEMBLIES.some((a) => a.trade === trade);
}

export function getAssembly(id: string): Assembly | undefined {
  return ASSEMBLIES.find((a) => a.id === id);
}

export interface AssemblyLine {
  assemblyId: string;
  quantity: number;
}

export interface AssemblyTotals {
  materialCost: number;
  laborHours: number;
  lines: {
    assembly: Assembly;
    quantity: number;
    material: number;
    laborHours: number;
  }[];
}

/**
 * Totals a list of assembly selections.
 *
 * `overrides` lets a contractor's own rate card replace the generic
 * defaults per assembly — their numbers always win.
 */
export function totalAssemblies(
  selections: AssemblyLine[],
  overrides: Record<string, { material?: number; laborHours?: number }> = {}
): AssemblyTotals {
  let materialCost = 0;
  let laborHours = 0;
  const lines: AssemblyTotals["lines"] = [];

  for (const sel of selections) {
    const assembly = getAssembly(sel.assemblyId);
    const quantity = Number(sel.quantity) || 0;
    if (!assembly || quantity <= 0) continue;

    const o = overrides[assembly.id] ?? {};
    const matRate = o.material ?? assembly.material;
    const hrRate = o.laborHours ?? assembly.laborHours;

    const material = quantity * matRate;
    const hours = quantity * hrRate;

    materialCost += material;
    laborHours += hours;
    lines.push({ assembly, quantity, material, laborHours: hours });
  }

  return {
    materialCost: Math.round(materialCost * 100) / 100,
    laborHours: Math.round(laborHours * 100) / 100,
    lines,
  };
}
