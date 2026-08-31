// ─── User Tiers ─────────────────────────────────────────────
export type UserTier = "GC" | "TRADE";

export interface TierConfig {
  tier: UserTier;
  label: string;
  description: string;
  canManageSubs: boolean; // GCs can manage subcontractors
  canCreateProjects: boolean; // GCs create projects, trades bid on scopes
}

export const TIERS: Record<UserTier, TierConfig> = {
  GC: {
    tier: "GC",
    label: "General Contractor",
    description: "Manage full projects, coordinate subs, and oversee all scopes of work",
    canManageSubs: true,
    canCreateProjects: true,
  },
  TRADE: {
    tier: "TRADE",
    label: "Trade / Subcontractor",
    description: "Bid on specific scopes, track your jobs, and manage your crew",
    canManageSubs: false,
    canCreateProjects: false,
  },
};

// ─── Trade Types ────────────────────────────────────────────
export type TradeType =
  | "electrical"
  | "plumbing"
  | "hvac"
  | "roofing"
  | "concrete"
  | "framing"
  | "painting"
  | "landscaping"
  | "drywall"
  | "flooring"
  | "masonry"
  | "welding"
  | "demolition"
  | "excavation"
  | "insulation"
  | "general";

// ─── Bid Metric Definitions ────────────────────────────────
export interface BidMetric {
  key: string;
  label: string;
  unit: string; // "$", "hrs", "sq ft", "linear ft", etc.
  type: "currency" | "number" | "percent";
  description: string;
  defaultValue?: number;
}

export interface TradeConfig {
  id: TradeType;
  label: string;
  icon: string;
  color: string;
  // Standard metrics every trade has
  standardMetrics: string[];
  // Trade-specific metrics unique to this trade
  specificMetrics: BidMetric[];
  // Default markup percentages for this trade
  defaultOverhead: number;
  defaultProfit: number;
  defaultContingency: number;
  // Units this trade typically bills in
  primaryUnit: string;
  // Common cost categories
  costCategories: string[];
}

// ─── All Available Bid Metrics ─────────────────────────────
export const ALL_METRICS: Record<string, BidMetric> = {
  // Universal metrics
  materialCost: {
    key: "materialCost",
    label: "Material Cost",
    unit: "$",
    type: "currency",
    description: "Total cost of materials",
  },
  laborHours: {
    key: "laborHours",
    label: "Labor Hours",
    unit: "hrs",
    type: "number",
    description: "Total estimated labor hours",
  },
  laborRate: {
    key: "laborRate",
    label: "Labor Rate",
    unit: "$/hr",
    type: "currency",
    description: "Hourly rate per worker",
  },
  crewSize: {
    key: "crewSize",
    label: "Crew Size",
    unit: "workers",
    type: "number",
    description: "Number of workers on the job",
  },
  equipmentCost: {
    key: "equipmentCost",
    label: "Equipment / Tool Rental",
    unit: "$",
    type: "currency",
    description: "Equipment rental and tool costs",
  },
  permitCost: {
    key: "permitCost",
    label: "Permits & Inspections",
    unit: "$",
    type: "currency",
    description: "Permit fees and inspection costs",
  },
  subcontractorCost: {
    key: "subcontractorCost",
    label: "Subcontractor Cost",
    unit: "$",
    type: "currency",
    description: "Cost of subcontracted work",
  },
  overheadPercent: {
    key: "overheadPercent",
    label: "Overhead",
    unit: "%",
    type: "percent",
    description: "Overhead percentage markup",
    defaultValue: 10,
  },
  profitPercent: {
    key: "profitPercent",
    label: "Profit Margin",
    unit: "%",
    type: "percent",
    description: "Desired profit percentage",
    defaultValue: 15,
  },
  contingencyPercent: {
    key: "contingencyPercent",
    label: "Contingency",
    unit: "%",
    type: "percent",
    description: "Contingency buffer percentage",
    defaultValue: 5,
  },

  // ─── Electrical-specific ──────────────────────────────────
  circuitCount: {
    key: "circuitCount",
    label: "Number of Circuits",
    unit: "circuits",
    type: "number",
    description: "Total circuits to install or modify",
  },
  panelUpgrades: {
    key: "panelUpgrades",
    label: "Panel Upgrades",
    unit: "panels",
    type: "number",
    description: "Number of electrical panels to upgrade",
  },
  wireFootage: {
    key: "wireFootage",
    label: "Wire Footage",
    unit: "linear ft",
    type: "number",
    description: "Total linear feet of wire needed",
  },
  fixtureCount: {
    key: "fixtureCount",
    label: "Fixture Count",
    unit: "fixtures",
    type: "number",
    description: "Number of fixtures to install",
  },
  conduitFootage: {
    key: "conduitFootage",
    label: "Conduit Footage",
    unit: "linear ft",
    type: "number",
    description: "Linear feet of conduit",
  },

  // ─── Plumbing-specific ────────────────────────────────────
  fixturePoints: {
    key: "fixturePoints",
    label: "Fixture Points",
    unit: "points",
    type: "number",
    description: "Number of plumbing fixture connection points",
  },
  pipeFootage: {
    key: "pipeFootage",
    label: "Pipe Footage",
    unit: "linear ft",
    type: "number",
    description: "Total linear feet of pipe",
  },
  drainPoints: {
    key: "drainPoints",
    label: "Drain Points",
    unit: "drains",
    type: "number",
    description: "Number of drain connections",
  },
  waterHeaters: {
    key: "waterHeaters",
    label: "Water Heaters",
    unit: "units",
    type: "number",
    description: "Number of water heaters to install",
  },
  gasLines: {
    key: "gasLines",
    label: "Gas Lines",
    unit: "lines",
    type: "number",
    description: "Number of gas lines to run",
  },

  // ─── HVAC-specific ────────────────────────────────────────
  tonnage: {
    key: "tonnage",
    label: "System Tonnage",
    unit: "tons",
    type: "number",
    description: "Total HVAC tonnage capacity",
  },
  ductFootage: {
    key: "ductFootage",
    label: "Ductwork Footage",
    unit: "linear ft",
    type: "number",
    description: "Total linear feet of ductwork",
  },
  ventCount: {
    key: "ventCount",
    label: "Vent / Register Count",
    unit: "vents",
    type: "number",
    description: "Number of vents and registers",
  },
  unitCount: {
    key: "unitCount",
    label: "Unit Count",
    unit: "units",
    type: "number",
    description: "Number of HVAC units to install",
  },
  refrigerantLines: {
    key: "refrigerantLines",
    label: "Refrigerant Line Sets",
    unit: "sets",
    type: "number",
    description: "Number of refrigerant line sets",
  },

  // ─── Roofing-specific ─────────────────────────────────────
  roofSquares: {
    key: "roofSquares",
    label: "Roof Squares",
    unit: "squares (100 sq ft)",
    type: "number",
    description: "Roof area in squares (1 square = 100 sq ft)",
  },
  tearOffLayers: {
    key: "tearOffLayers",
    label: "Tear-Off Layers",
    unit: "layers",
    type: "number",
    description: "Number of existing layers to remove",
  },
  ridgeLinearFt: {
    key: "ridgeLinearFt",
    label: "Ridge / Hip Linear Ft",
    unit: "linear ft",
    type: "number",
    description: "Linear feet of ridge and hip caps",
  },
  flashingPoints: {
    key: "flashingPoints",
    label: "Flashing Points",
    unit: "points",
    type: "number",
    description: "Number of flashing and penetration points",
  },
  dumpsterLoads: {
    key: "dumpsterLoads",
    label: "Dumpster Loads",
    unit: "loads",
    type: "number",
    description: "Estimated dumpster loads for debris",
  },

  // ─── Concrete-specific ────────────────────────────────────
  cubicYards: {
    key: "cubicYards",
    label: "Cubic Yards",
    unit: "cu yd",
    type: "number",
    description: "Total cubic yards of concrete",
  },
  slabSqFt: {
    key: "slabSqFt",
    label: "Slab Square Footage",
    unit: "sq ft",
    type: "number",
    description: "Total slab area in square feet",
  },
  rebarTons: {
    key: "rebarTons",
    label: "Rebar (tons)",
    unit: "tons",
    type: "number",
    description: "Tons of rebar reinforcement",
  },
  formworkLinearFt: {
    key: "formworkLinearFt",
    label: "Formwork Linear Ft",
    unit: "linear ft",
    type: "number",
    description: "Linear feet of formwork needed",
  },
  pumpHours: {
    key: "pumpHours",
    label: "Pump Truck Hours",
    unit: "hrs",
    type: "number",
    description: "Hours of concrete pump truck rental",
  },

  // ─── Framing-specific ─────────────────────────────────────
  boardFeet: {
    key: "boardFeet",
    label: "Board Feet (lumber)",
    unit: "bd ft",
    type: "number",
    description: "Total board feet of lumber",
  },
  wallLinearFt: {
    key: "wallLinearFt",
    label: "Wall Linear Feet",
    unit: "linear ft",
    type: "number",
    description: "Total linear feet of wall framing",
  },
  trusses: {
    key: "trusses",
    label: "Trusses",
    unit: "trusses",
    type: "number",
    description: "Number of trusses to set",
  },
  sheathingSheets: {
    key: "sheathingSheets",
    label: "Sheathing Sheets",
    unit: "sheets",
    type: "number",
    description: "Number of sheathing sheets (4x8)",
  },
  headerCount: {
    key: "headerCount",
    label: "Headers / Beams",
    unit: "headers",
    type: "number",
    description: "Number of headers and beams to install",
  },

  // ─── Painting-specific ────────────────────────────────────
  paintSqFt: {
    key: "paintSqFt",
    label: "Paintable Sq Ft",
    unit: "sq ft",
    type: "number",
    description: "Total paintable surface area",
  },
  coats: {
    key: "coats",
    label: "Number of Coats",
    unit: "coats",
    type: "number",
    description: "Number of paint coats needed",
    defaultValue: 2,
  },
  gallons: {
    key: "gallons",
    label: "Gallons of Paint",
    unit: "gallons",
    type: "number",
    description: "Total gallons of paint required",
  },
  prepHours: {
    key: "prepHours",
    label: "Surface Prep Hours",
    unit: "hrs",
    type: "number",
    description: "Hours for surface prep (scraping, sanding, priming)",
  },
  colors: {
    key: "colors",
    label: "Number of Colors",
    unit: "colors",
    type: "number",
    description: "Distinct paint colors (affects setup time)",
  },

  // ─── Landscaping-specific ─────────────────────────────────
  lotSqFt: {
    key: "lotSqFt",
    label: "Lot Square Footage",
    unit: "sq ft",
    type: "number",
    description: "Total lot area in square feet",
  },
  sodPallets: {
    key: "sodPallets",
    label: "Sod Pallets",
    unit: "pallets",
    type: "number",
    description: "Number of sod pallets",
  },
  treesAndShrubs: {
    key: "treesAndShrubs",
    label: "Trees & Shrubs",
    unit: "plants",
    type: "number",
    description: "Number of trees and shrubs to plant",
  },
  mulchYards: {
    key: "mulchYards",
    label: "Mulch (cu yards)",
    unit: "cu yd",
    type: "number",
    description: "Cubic yards of mulch",
  },
  irrigationZones: {
    key: "irrigationZones",
    label: "Irrigation Zones",
    unit: "zones",
    type: "number",
    description: "Number of irrigation zones to install",
  },

  // ─── Drywall-specific ─────────────────────────────────────
  drywallSheets: {
    key: "drywallSheets",
    label: "Drywall Sheets",
    unit: "sheets (4x8)",
    type: "number",
    description: "Number of 4x8 drywall sheets",
  },
  drywallSqFt: {
    key: "drywallSqFt",
    label: "Drywall Sq Ft",
    unit: "sq ft",
    type: "number",
    description: "Total square footage of drywall",
  },
  finishLevel: {
    key: "finishLevel",
    label: "Finish Level (0-5)",
    unit: "level",
    type: "number",
    description: "Drywall finish level (0 = none, 5 = skim coat)",
    defaultValue: 4,
  },
  cornerBeadFt: {
    key: "cornerBeadFt",
    label: "Corner Bead Linear Ft",
    unit: "linear ft",
    type: "number",
    description: "Linear feet of corner bead",
  },

  // ─── Flooring-specific ────────────────────────────────────
  floorSqFt: {
    key: "floorSqFt",
    label: "Floor Sq Ft",
    unit: "sq ft",
    type: "number",
    description: "Total floor area in square feet",
  },
  transitionStrips: {
    key: "transitionStrips",
    label: "Transition Strips",
    unit: "strips",
    type: "number",
    description: "Number of transition strips between rooms/materials",
  },
  underlaymentSqFt: {
    key: "underlaymentSqFt",
    label: "Underlayment Sq Ft",
    unit: "sq ft",
    type: "number",
    description: "Square footage of underlayment needed",
  },
  stairCount: {
    key: "stairCount",
    label: "Stairs",
    unit: "stairs",
    type: "number",
    description: "Number of stair treads to cover",
  },

  // ─── Masonry-specific ─────────────────────────────────────
  blockCount: {
    key: "blockCount",
    label: "Block / Brick Count",
    unit: "blocks",
    type: "number",
    description: "Total blocks or bricks needed",
  },
  wallSqFt: {
    key: "wallSqFt",
    label: "Wall Sq Ft",
    unit: "sq ft",
    type: "number",
    description: "Total masonry wall area",
  },
  mortarBags: {
    key: "mortarBags",
    label: "Mortar Bags",
    unit: "bags",
    type: "number",
    description: "Number of mortar bags needed",
  },
  scaffoldDays: {
    key: "scaffoldDays",
    label: "Scaffold Rental Days",
    unit: "days",
    type: "number",
    description: "Days of scaffold rental",
  },

  // ─── Demolition-specific ──────────────────────────────────
  demoSqFt: {
    key: "demoSqFt",
    label: "Demo Area Sq Ft",
    unit: "sq ft",
    type: "number",
    description: "Total demolition area",
  },
  demoHaulLoads: {
    key: "demoHaulLoads",
    label: "Haul-Off Loads",
    unit: "loads",
    type: "number",
    description: "Number of debris haul-off loads",
  },
  hazmatRequired: {
    key: "hazmatRequired",
    label: "Hazmat Abatement",
    unit: "yes/no",
    type: "number",
    description: "Whether hazmat abatement is required (1 = yes, 0 = no)",
    defaultValue: 0,
  },

  // ─── Excavation-specific ──────────────────────────────────
  excavationCuYd: {
    key: "excavationCuYd",
    label: "Excavation Cu Yards",
    unit: "cu yd",
    type: "number",
    description: "Cubic yards to excavate",
  },
  gradeAcres: {
    key: "gradeAcres",
    label: "Grading Area (acres)",
    unit: "acres",
    type: "number",
    description: "Total area to grade in acres",
  },
  trenchLinearFt: {
    key: "trenchLinearFt",
    label: "Trench Linear Ft",
    unit: "linear ft",
    type: "number",
    description: "Linear feet of trenching",
  },
  fillDirtLoads: {
    key: "fillDirtLoads",
    label: "Fill Dirt Loads",
    unit: "loads",
    type: "number",
    description: "Loads of fill dirt needed",
  },

  // ─── Welding-specific ─────────────────────────────────────
  weldInches: {
    key: "weldInches",
    label: "Weld Inches",
    unit: "inches",
    type: "number",
    description: "Total inches of weld",
  },
  steelTons: {
    key: "steelTons",
    label: "Steel (tons)",
    unit: "tons",
    type: "number",
    description: "Tons of structural steel",
  },
  jointsCount: {
    key: "jointsCount",
    label: "Joint Count",
    unit: "joints",
    type: "number",
    description: "Number of weld joints",
  },
  certifiedWelders: {
    key: "certifiedWelders",
    label: "Certified Welders Needed",
    unit: "welders",
    type: "number",
    description: "Number of certified welders required",
  },

  // ─── Insulation-specific ──────────────────────────────────
  insulationSqFt: {
    key: "insulationSqFt",
    label: "Insulation Sq Ft",
    unit: "sq ft",
    type: "number",
    description: "Total insulation area",
  },
  rValue: {
    key: "rValue",
    label: "R-Value",
    unit: "R",
    type: "number",
    description: "Target R-value for insulation",
  },
  sprayFoamSqFt: {
    key: "sprayFoamSqFt",
    label: "Spray Foam Sq Ft",
    unit: "sq ft",
    type: "number",
    description: "Square footage for spray foam application",
  },

  // ─── GC-specific ──────────────────────────────────────────
  totalProjectSqFt: {
    key: "totalProjectSqFt",
    label: "Total Project Sq Ft",
    unit: "sq ft",
    type: "number",
    description: "Total project square footage",
  },
  subBidCount: {
    key: "subBidCount",
    label: "Sub Bids to Coordinate",
    unit: "bids",
    type: "number",
    description: "Number of subcontractor bids to manage",
  },
  projectDuration: {
    key: "projectDuration",
    label: "Project Duration",
    unit: "weeks",
    type: "number",
    description: "Expected project duration in weeks",
  },
  insuranceCost: {
    key: "insuranceCost",
    label: "Insurance / Bonding",
    unit: "$",
    type: "currency",
    description: "Project-specific insurance and bonding costs",
  },
  managementFee: {
    key: "managementFee",
    label: "Management Fee",
    unit: "%",
    type: "percent",
    description: "GC management fee percentage",
    defaultValue: 10,
  },
};

// ─── Trade Configurations ───────────────────────────────────
export const TRADE_CONFIGS: Record<TradeType, TradeConfig> = {
  general: {
    id: "general",
    label: "General Contractor",
    icon: "🏗️",
    color: "blue",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "subcontractorCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.totalProjectSqFt,
      ALL_METRICS.subBidCount,
      ALL_METRICS.projectDuration,
      ALL_METRICS.insuranceCost,
      ALL_METRICS.managementFee,
    ],
    defaultOverhead: 12,
    defaultProfit: 15,
    defaultContingency: 5,
    primaryUnit: "sq ft",
    costCategories: ["Material", "Labor", "Equipment", "Subcontractor", "Permit", "Insurance", "Management", "Other"],
  },
  electrical: {
    id: "electrical",
    label: "Electrical",
    icon: "⚡",
    color: "yellow",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.circuitCount,
      ALL_METRICS.panelUpgrades,
      ALL_METRICS.wireFootage,
      ALL_METRICS.fixtureCount,
      ALL_METRICS.conduitFootage,
    ],
    defaultOverhead: 10,
    defaultProfit: 18,
    defaultContingency: 5,
    primaryUnit: "circuits",
    costCategories: ["Wire & Cable", "Panels & Breakers", "Fixtures", "Conduit", "Labor", "Equipment", "Permit", "Other"],
  },
  plumbing: {
    id: "plumbing",
    label: "Plumbing",
    icon: "🔧",
    color: "cyan",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.fixturePoints,
      ALL_METRICS.pipeFootage,
      ALL_METRICS.drainPoints,
      ALL_METRICS.waterHeaters,
      ALL_METRICS.gasLines,
    ],
    defaultOverhead: 10,
    defaultProfit: 16,
    defaultContingency: 5,
    primaryUnit: "fixture points",
    costCategories: ["Pipe & Fittings", "Fixtures", "Water Heaters", "Gas Line", "Labor", "Equipment", "Permit", "Other"],
  },
  hvac: {
    id: "hvac",
    label: "HVAC",
    icon: "❄️",
    color: "sky",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.tonnage,
      ALL_METRICS.ductFootage,
      ALL_METRICS.ventCount,
      ALL_METRICS.unitCount,
      ALL_METRICS.refrigerantLines,
    ],
    defaultOverhead: 12,
    defaultProfit: 18,
    defaultContingency: 5,
    primaryUnit: "tons",
    costCategories: ["Units & Equipment", "Ductwork", "Refrigerant", "Controls", "Labor", "Equipment", "Permit", "Other"],
  },
  roofing: {
    id: "roofing",
    label: "Roofing",
    icon: "🏠",
    color: "red",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.roofSquares,
      ALL_METRICS.tearOffLayers,
      ALL_METRICS.ridgeLinearFt,
      ALL_METRICS.flashingPoints,
      ALL_METRICS.dumpsterLoads,
    ],
    defaultOverhead: 10,
    defaultProfit: 20,
    defaultContingency: 5,
    primaryUnit: "squares",
    costCategories: ["Shingles / Material", "Underlayment", "Flashing", "Dumpster", "Labor", "Equipment", "Permit", "Other"],
  },
  concrete: {
    id: "concrete",
    label: "Concrete",
    icon: "🧱",
    color: "gray",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.cubicYards,
      ALL_METRICS.slabSqFt,
      ALL_METRICS.rebarTons,
      ALL_METRICS.formworkLinearFt,
      ALL_METRICS.pumpHours,
    ],
    defaultOverhead: 10,
    defaultProfit: 15,
    defaultContingency: 8,
    primaryUnit: "cu yd",
    costCategories: ["Concrete", "Rebar", "Formwork", "Pump Truck", "Labor", "Equipment", "Permit", "Other"],
  },
  framing: {
    id: "framing",
    label: "Framing",
    icon: "🪵",
    color: "amber",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.boardFeet,
      ALL_METRICS.wallLinearFt,
      ALL_METRICS.trusses,
      ALL_METRICS.sheathingSheets,
      ALL_METRICS.headerCount,
    ],
    defaultOverhead: 10,
    defaultProfit: 15,
    defaultContingency: 5,
    primaryUnit: "bd ft",
    costCategories: ["Lumber", "Trusses", "Sheathing", "Hardware", "Labor", "Equipment", "Other"],
  },
  painting: {
    id: "painting",
    label: "Painting",
    icon: "🎨",
    color: "purple",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.paintSqFt,
      ALL_METRICS.coats,
      ALL_METRICS.gallons,
      ALL_METRICS.prepHours,
      ALL_METRICS.colors,
    ],
    defaultOverhead: 8,
    defaultProfit: 20,
    defaultContingency: 3,
    primaryUnit: "sq ft",
    costCategories: ["Paint", "Primer", "Supplies", "Prep Materials", "Labor", "Equipment", "Other"],
  },
  landscaping: {
    id: "landscaping",
    label: "Landscaping",
    icon: "🌿",
    color: "green",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.lotSqFt,
      ALL_METRICS.sodPallets,
      ALL_METRICS.treesAndShrubs,
      ALL_METRICS.mulchYards,
      ALL_METRICS.irrigationZones,
    ],
    defaultOverhead: 10,
    defaultProfit: 18,
    defaultContingency: 5,
    primaryUnit: "sq ft",
    costCategories: ["Plants & Trees", "Sod", "Mulch", "Irrigation", "Hardscape", "Labor", "Equipment", "Other"],
  },
  drywall: {
    id: "drywall",
    label: "Drywall",
    icon: "🪟",
    color: "stone",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.drywallSheets,
      ALL_METRICS.drywallSqFt,
      ALL_METRICS.finishLevel,
      ALL_METRICS.cornerBeadFt,
    ],
    defaultOverhead: 8,
    defaultProfit: 18,
    defaultContingency: 3,
    primaryUnit: "sheets",
    costCategories: ["Drywall Sheets", "Mud & Tape", "Corner Bead", "Screws", "Labor", "Equipment", "Other"],
  },
  flooring: {
    id: "flooring",
    label: "Flooring",
    icon: "🪵",
    color: "orange",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.floorSqFt,
      ALL_METRICS.transitionStrips,
      ALL_METRICS.underlaymentSqFt,
      ALL_METRICS.stairCount,
    ],
    defaultOverhead: 8,
    defaultProfit: 20,
    defaultContingency: 5,
    primaryUnit: "sq ft",
    costCategories: ["Flooring Material", "Underlayment", "Transitions", "Adhesive", "Labor", "Equipment", "Other"],
  },
  masonry: {
    id: "masonry",
    label: "Masonry",
    icon: "🧱",
    color: "rose",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.blockCount,
      ALL_METRICS.wallSqFt,
      ALL_METRICS.mortarBags,
      ALL_METRICS.scaffoldDays,
    ],
    defaultOverhead: 10,
    defaultProfit: 15,
    defaultContingency: 5,
    primaryUnit: "blocks",
    costCategories: ["Block / Brick", "Mortar", "Scaffold", "Rebar", "Labor", "Equipment", "Other"],
  },
  welding: {
    id: "welding",
    label: "Welding",
    icon: "🔥",
    color: "orange",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.weldInches,
      ALL_METRICS.steelTons,
      ALL_METRICS.jointsCount,
      ALL_METRICS.certifiedWelders,
    ],
    defaultOverhead: 12,
    defaultProfit: 20,
    defaultContingency: 5,
    primaryUnit: "weld inches",
    costCategories: ["Steel", "Welding Supplies", "Consumables", "Labor", "Equipment", "Certification", "Other"],
  },
  demolition: {
    id: "demolition",
    label: "Demolition",
    icon: "💥",
    color: "red",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.demoSqFt,
      ALL_METRICS.demoHaulLoads,
      ALL_METRICS.hazmatRequired,
    ],
    defaultOverhead: 10,
    defaultProfit: 18,
    defaultContingency: 10,
    primaryUnit: "sq ft",
    costCategories: ["Dumpster / Haul-Off", "Hazmat", "Labor", "Equipment", "Permit", "Other"],
  },
  excavation: {
    id: "excavation",
    label: "Excavation",
    icon: "⛏️",
    color: "yellow",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost", "permitCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.excavationCuYd,
      ALL_METRICS.gradeAcres,
      ALL_METRICS.trenchLinearFt,
      ALL_METRICS.fillDirtLoads,
    ],
    defaultOverhead: 12,
    defaultProfit: 15,
    defaultContingency: 8,
    primaryUnit: "cu yd",
    costCategories: ["Fill Dirt", "Gravel", "Haul-Off", "Labor", "Equipment", "Permit", "Other"],
  },
  insulation: {
    id: "insulation",
    label: "Insulation",
    icon: "🧤",
    color: "pink",
    standardMetrics: [
      "materialCost", "laborHours", "laborRate", "crewSize",
      "equipmentCost",
      "overheadPercent", "profitPercent", "contingencyPercent",
    ],
    specificMetrics: [
      ALL_METRICS.insulationSqFt,
      ALL_METRICS.rValue,
      ALL_METRICS.sprayFoamSqFt,
    ],
    defaultOverhead: 8,
    defaultProfit: 20,
    defaultContingency: 3,
    primaryUnit: "sq ft",
    costCategories: ["Batt Insulation", "Spray Foam", "Blown-In", "Vapor Barrier", "Labor", "Equipment", "Other"],
  },
};

// ─── Helper Functions ───────────────────────────────────────
export function getTradeConfig(tradeType: string): TradeConfig {
  return TRADE_CONFIGS[tradeType as TradeType] || TRADE_CONFIGS.general;
}

export function getTradeMetrics(tradeType: string): BidMetric[] {
  const config = getTradeConfig(tradeType);
  const standardMetricObjects = config.standardMetrics.map((key) => ALL_METRICS[key]).filter(Boolean);
  return [...standardMetricObjects, ...config.specificMetrics];
}

export function getTradeSpecificMetrics(tradeType: string): BidMetric[] {
  const config = getTradeConfig(tradeType);
  return config.specificMetrics;
}

export function getAllTradeOptions(): { value: string; label: string; icon: string }[] {
  return Object.values(TRADE_CONFIGS).map((tc) => ({
    value: tc.id,
    label: tc.label,
    icon: tc.icon,
  }));
}

// ─── Trade ID Normalization ─────────────────────────────────
/**
 * Maps a human-facing trade label to its canonical TradeType id.
 *
 * The registration form presents display names ("Electrical", "HVAC",
 * "General Contractor") while the rest of the app keys on lowercase ids
 * ("electrical", "hvac", "general"). Storing the display name meant trade
 * lookups silently failed and saving Settings wiped the user's selection.
 * Normalize on write so both sides agree.
 */
export function normalizeTradeId(input: string | null | undefined): string | null {
  if (!input) return null;

  const raw = input.trim();
  if (!raw) return null;

  const key = raw.toLowerCase().replace(/[\s_-]+/g, "");

  const aliases: Record<string, TradeType> = {
    generalcontractor: "general",
    gc: "general",
    general: "general",
    electrical: "electrical",
    electrician: "electrical",
    plumbing: "plumbing",
    plumber: "plumbing",
    hvac: "hvac",
    roofing: "roofing",
    roofer: "roofing",
    concrete: "concrete",
    framing: "framing",
    framer: "framing",
    painting: "painting",
    painter: "painting",
    landscaping: "landscaping",
    drywall: "drywall",
    flooring: "flooring",
    masonry: "masonry",
    welding: "welding",
    demolition: "demolition",
    excavation: "excavation",
    insulation: "insulation",
  };

  return aliases[key] ?? key;
}

/** Normalizes a list of trade labels, dropping blanks and duplicates. */
export function normalizeTradeIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out = new Set<string>();
  for (const item of input) {
    const id = normalizeTradeId(typeof item === "string" ? item : null);
    if (id) out.add(id);
  }
  return [...out];
}
