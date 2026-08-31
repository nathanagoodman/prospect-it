import type { TradeType } from "./trades";

/**
 * Editorial content for the public /trades pages.
 *
 * Ground rules for anything added here: describe how the trade is actually
 * estimated and what this product does. Do NOT add industry statistics,
 * benchmarks, or performance claims — those would need a citable source,
 * and unsourced numbers are both a legal risk and a trust signal that
 * search engines and AI assistants penalise.
 */
export interface TradeContent {
  /** URL slug — also the TradeType key. */
  slug: TradeType;
  /** H1 / page title focus. */
  headline: string;
  /** Meta description, ~150 chars. */
  metaDescription: string;
  /** Opening paragraph — what makes estimating this trade distinct. */
  intro: string;
  /** What drives cost on a typical job in this trade. */
  costDrivers: string[];
  /** Where estimates in this trade commonly go wrong. */
  pitfalls: string[];
  /** Question/answer pairs, also emitted as FAQPage schema. */
  faqs: { q: string; a: string }[];
}

export const TRADE_CONTENT: Partial<Record<TradeType, TradeContent>> = {
  electrical: {
    slug: "electrical",
    headline: "Electrical Estimating & Bidding Software",
    metaDescription:
      "Build electrical bids around circuit counts, panel work, wire runs, and fixtures — with overhead, profit, and contingency calculated automatically.",
    intro:
      "Electrical bids live or die on takeoff detail. Two jobs with identical square footage can differ by thousands depending on circuit count, panel capacity, and how far the wire has to run. Pro Spec IQ gives electrical contractors inputs built for that reality instead of a generic cost box.",
    costDrivers: [
      "Circuit count and home-run distances, which drive both wire and labor hours",
      "Panel work — whether you're adding breakers, upgrading a service, or setting a new panel",
      "Fixture and device counts, including trim-out labor that's easy to underestimate",
      "Conduit footage and the method required (EMT, PVC, MC) for the occupancy type",
      "Permit and inspection requirements, which vary widely by jurisdiction",
    ],
    pitfalls: [
      "Pricing wire by the spool instead of by measured run, then absorbing the overage",
      "Forgetting that trim-out is a second mobilization with its own labor hours",
      "Treating the panel as a single line item when a service upgrade carries utility coordination",
      "Leaving permit and inspection time out of the labor number entirely",
    ],
    faqs: [
      {
        q: "How do you estimate an electrical job?",
        a: "Start with a takeoff: count circuits, devices, and fixtures, and measure wire and conduit runs. Price material from those counts, then apply your labor rate to the hours each assembly requires. Add equipment, permits, and inspection time, then layer overhead, profit, and contingency on the subtotal. Pro Spec IQ structures the estimate in that order so nothing gets skipped.",
      },
      {
        q: "What overhead and profit should an electrical contractor use?",
        a: "It depends on your fixed costs, your market, and how much risk the job carries. Pro Spec IQ starts electrical bids at 10% overhead, 18% profit, and 5% contingency as an editable starting point — every one of those is a field you set per bid, not a fixed rule.",
      },
      {
        q: "Can I bid electrical work as a subcontractor to a GC?",
        a: "Yes. Trade accounts are built for scope bidding — you estimate your portion, submit it, and track it through to the job. General contractor accounts work the other way around, combining multiple trade scopes into one project bid.",
      },
    ],
  },

  plumbing: {
    slug: "plumbing",
    headline: "Plumbing Estimating & Bidding Software",
    metaDescription:
      "Estimate plumbing jobs by fixture count, pipe runs, and rough-in scope, with material, labor, and markups tracked on every bid.",
    intro:
      "Plumbing estimates hinge on fixture counts and what's behind the wall. Rough-in and finish are effectively two jobs with different crews, different timing, and different risk — and the cost of getting the rough wrong is tearing something out. Pro Spec IQ separates those inputs so the bid reflects the actual sequence.",
    costDrivers: [
      "Fixture count and type, which sets both material cost and trim labor",
      "Pipe footage by material — copper, PEX, and cast iron price and install very differently",
      "Water heater or boiler scope, including venting and any gas work",
      "Drain, waste, and vent complexity, especially on remodels with existing stacks",
      "Excavation or slab work required to reach existing lines",
    ],
    pitfalls: [
      "Bidding a remodel rough-in before anyone has opened a wall",
      "Missing the second mobilization between rough-in and trim",
      "Underpricing DWV on older buildings where the existing stack doesn't meet current code",
      "Omitting the cost of pulling and passing a pressure test",
    ],
    faqs: [
      {
        q: "How do you estimate a plumbing job?",
        a: "Count fixtures, measure pipe runs by material, and separate rough-in from finish. Price material from those counts, apply labor hours to each phase, then add equipment, permits, and testing. Overhead, profit, and contingency go on the subtotal. Pro Spec IQ keeps rough-in and trim as distinct inputs so both mobilizations get priced.",
      },
      {
        q: "What markup do plumbing contractors use?",
        a: "There's no single correct number — it depends on your overhead structure and the risk in the job. Pro Spec IQ defaults plumbing bids to 10% overhead, 18% profit, and 5% contingency, all editable per bid.",
      },
      {
        q: "Does it handle service work as well as new construction?",
        a: "Yes. Service calls tend to be labor-heavy with light material, and new construction is the reverse. Because material, labor hours, and labor rate are separate inputs, the same estimator handles both without forcing you into one shape.",
      },
    ],
  },

  hvac: {
    slug: "hvac",
    headline: "HVAC Estimating & Bidding Software",
    metaDescription:
      "Price HVAC jobs by tonnage, ductwork, and equipment, with labor, permits, and markups calculated on every bid.",
    intro:
      "HVAC bids combine a big equipment line with highly variable ductwork and labor. The equipment is the easy part to price and the hard part to margin — the money is usually made or lost on duct runs, access, and commissioning. Pro Spec IQ keeps equipment and installation separate so you can see both.",
    costDrivers: [
      "System tonnage and equipment selection, typically the largest single line",
      "Duct footage and configuration, including whether existing duct can be reused",
      "Register and return counts, which drive both material and balancing labor",
      "Refrigerant line length and any required lineset replacement",
      "Access difficulty — attic, crawlspace, and rooftop installs carry very different labor",
    ],
    pitfalls: [
      "Passing equipment through at cost and losing margin on the largest line on the bid",
      "Assuming existing ductwork is reusable before inspecting it",
      "Leaving commissioning and airflow balancing out of the labor number",
      "Not accounting for crane or lift time on rooftop units",
    ],
    faqs: [
      {
        q: "How do you estimate an HVAC installation?",
        a: "Size the system first, then price equipment, ductwork, linesets, and registers as separate lines. Apply labor hours to installation and commissioning, add permits and any lift or crane cost, then apply overhead, profit, and contingency. Pro Spec IQ tracks tonnage, duct footage, and register counts as distinct inputs.",
      },
      {
        q: "Should equipment carry the same markup as labor?",
        a: "Many contractors mark equipment differently from labor, since a pass-through price on a large equipment line can quietly erase the margin on the whole job. Pro Spec IQ applies overhead and profit to the full subtotal by default, and every percentage is editable per bid.",
      },
      {
        q: "What defaults does the HVAC estimator start with?",
        a: "HVAC bids start at 12% overhead, 18% profit, and 5% contingency. Those are starting points you adjust — not fixed values.",
      },
    ],
  },

  roofing: {
    slug: "roofing",
    headline: "Roofing Estimating & Bidding Software",
    metaDescription:
      "Estimate roofing jobs by squares, pitch, and layers, with tear-off, material, labor, and markups on every bid.",
    intro:
      "Roofing is one of the more measurable trades — squares, pitch, and layers give you most of the estimate. The variance is in what's underneath: decking condition and tear-off scope can move a job substantially once the old roof is off. Pro Spec IQ prices the known work and gives contingency a real place in the bid.",
    costDrivers: [
      "Roof area in squares, the primary unit almost everything else scales from",
      "Pitch, which affects both labor rate and required fall protection",
      "Number of existing layers to tear off and dispose of",
      "Decking replacement, usually unknown until tear-off begins",
      "Penetrations, valleys, and flashing detail, which are labor-dense relative to area",
    ],
    pitfalls: [
      "Bidding decking replacement at zero and eating it as a change order fight",
      "Using a flat labor rate across pitches that need different crews and safety setup",
      "Forgetting dumpster and disposal cost on multi-layer tear-offs",
      "Underestimating flashing labor on roofs with many penetrations",
    ],
    faqs: [
      {
        q: "How do you estimate a roofing job?",
        a: "Measure the roof in squares, note pitch and layer count, and price material from the square count plus waste. Add tear-off and disposal, then labor adjusted for pitch. Include flashing and penetration detail, then apply overhead, profit, and contingency. Pro Spec IQ tracks squares, pitch, and layers as explicit inputs.",
      },
      {
        q: "How should I handle unknown decking damage in a bid?",
        a: "The common approaches are a contingency percentage, a stated unit price for decking replacement, or both. Pro Spec IQ includes contingency as a standard field on every bid, defaulting to 8% on roofing, which is higher than most other trades for exactly this reason.",
      },
      {
        q: "Does it handle both residential and commercial roofing?",
        a: "Yes. The inputs are unit-based rather than tied to a building type, so steep-slope residential and low-slope commercial both estimate cleanly.",
      },
    ],
  },

  concrete: {
    slug: "concrete",
    headline: "Concrete Estimating & Bidding Software",
    metaDescription:
      "Price concrete work by cubic yards, forming, and finish type, with labor, pumping, and markups calculated per bid.",
    intro:
      "Concrete estimating starts with volume but rarely ends there. Forming and finishing routinely carry more labor than the pour itself, and placement method can change the number substantially. Pro Spec IQ separates volume, forming, and finish so the labor is visible rather than buried in a yard price.",
    costDrivers: [
      "Cubic yards of concrete, including waste allowance",
      "Form square footage and whether forms are reusable on the job",
      "Finish type — broom, trowel, exposed aggregate, and stamped are very different labor",
      "Reinforcement: rebar tonnage or mesh area, plus tie labor",
      "Placement method, since pump time and truck access can dominate a small pour",
    ],
    pitfalls: [
      "Quoting from a per-yard price that silently assumes an easy pour and simple finish",
      "Underestimating form labor on anything other than a flat slab",
      "Missing pump cost on jobs where the truck can't reach the placement",
      "Not pricing weather protection on cold or hot weather pours",
    ],
    faqs: [
      {
        q: "How do you estimate concrete work?",
        a: "Calculate volume in cubic yards with a waste allowance, then price forming by square foot and reinforcement by weight or area. Add finish labor by type, placement and pump cost, then apply overhead, profit, and contingency. Pro Spec IQ tracks yards, form area, and rebar as separate inputs.",
      },
      {
        q: "How much waste should I include on a concrete order?",
        a: "Waste allowance depends on the pour type, form accuracy, and site conditions, so it's a judgment call rather than a fixed figure. Pro Spec IQ exposes it as an input on the bid so it's an explicit decision instead of something absorbed into the yard price.",
      },
      {
        q: "What defaults does the concrete estimator use?",
        a: "Concrete bids start at 12% overhead, 15% profit, and 7% contingency — the higher contingency reflecting weather and subgrade risk. All are editable.",
      },
    ],
  },

  framing: {
    slug: "framing",
    headline: "Framing Estimating & Bidding Software",
    metaDescription:
      "Estimate framing by square footage, lumber, and crew hours, with material, labor, and markups tracked per bid.",
    intro:
      "Framing bids are labor-dominant and lumber-volatile. The crew hours are reasonably predictable from square footage and complexity; the material cost can move between bid and build. Pro Spec IQ keeps material and labor separate so a lumber swing doesn't hide what's happening to your labor margin.",
    costDrivers: [
      "Framed square footage and number of stories",
      "Lumber package cost, which can move significantly between bid and purchase",
      "Crew size and duration, the dominant labor variable",
      "Complexity — roof geometry, tall walls, and cut-up floor plans add hours faster than area",
      "Sheathing and fastener quantities, which scale with wall and roof area",
    ],
    pitfalls: [
      "Holding a lumber price too long on a bid that won't be built for months",
      "Estimating from square footage alone on a plan with complex roof framing",
      "Missing crane or lift time on tall wall panels",
      "Not separating material from labor, which hides where margin is actually going",
    ],
    faqs: [
      {
        q: "How do you estimate framing?",
        a: "Take off the lumber package from the plans, then estimate crew hours from framed area adjusted for complexity. Price sheathing and fasteners by area, add equipment, then apply overhead, profit, and contingency. Pro Spec IQ tracks square footage, crew size, and material cost as separate inputs.",
      },
      {
        q: "How do I protect a framing bid against lumber price changes?",
        a: "Common approaches are a bid expiration date, a stated material escalation clause, or a contingency sized to the exposure. Pro Spec IQ puts an expiration date and a contingency percentage on every bid, so both are available without a workaround.",
      },
      {
        q: "Can I track the job after the bid is accepted?",
        a: "Yes. An accepted bid converts to a job with daily logs, change orders, and budget-versus-actual tracking, so the estimate and the build stay connected.",
      },
    ],
  },

  drywall: {
    slug: "drywall",
    headline: "Drywall Estimating & Bidding Software",
    metaDescription:
      "Estimate drywall by sheet count, finish level, and square footage, with hanging, finishing, and markups per bid.",
    intro:
      "Drywall estimating is deceptively simple: area gives you sheets, and sheets give you material. The labor is where bids diverge, because finish level changes the hours dramatically for identical square footage. Pro Spec IQ makes finish level an explicit input rather than an assumption.",
    costDrivers: [
      "Wall and ceiling square footage, converted to sheet count with waste",
      "Finish level, which can change finishing labor substantially at the same area",
      "Ceiling height and whether stilts, benches, or lifts are needed",
      "Corner bead footage and the number of inside and outside corners",
      "Texture type, if any, and whether it's sprayed or hand-applied",
    ],
    pitfalls: [
      "Quoting a square-foot price without confirming the finish level expected",
      "Treating ceilings at the same labor rate as walls",
      "Forgetting that high ceilings change both access equipment and hanging hours",
      "Missing the number of corners on a cut-up plan",
    ],
    faqs: [
      {
        q: "How do you estimate a drywall job?",
        a: "Calculate wall and ceiling area, convert to sheets with a waste allowance, then price hanging and finishing labor separately with finish level applied to the finishing hours. Add corner bead, texture, and access equipment, then apply markups. Pro Spec IQ tracks sheet count and finish level as distinct inputs.",
      },
      {
        q: "Why does finish level matter so much in a drywall bid?",
        a: "Finish level governs how many coats and how much sanding the job requires. Two rooms with identical square footage can carry very different finishing hours depending on the level specified, which is why it belongs in the estimate as its own input rather than folded into a blended rate.",
      },
      {
        q: "Does it handle hanging and finishing as separate scopes?",
        a: "Yes. Labor hours and rate are their own fields, so you can bid hang-only, finish-only, or both without distorting the material side of the estimate.",
      },
    ],
  },

  painting: {
    slug: "painting",
    headline: "Painting Estimating & Bidding Software",
    metaDescription:
      "Estimate painting by square footage, coats, and surface prep, with material, labor, and markups on every bid.",
    intro:
      "Painting bids are won and lost on prep. Coverage math is straightforward once you know the area and coat count, but surface condition can double the labor without changing a single square foot. Pro Spec IQ separates prep from application so the bid shows where the hours actually go.",
    costDrivers: [
      "Surface area by substrate — drywall, wood, and masonry absorb very differently",
      "Number of coats, including whether primer is required",
      "Prep scope: patching, sanding, caulking, and masking",
      "Height and access, which determine whether ladders, lifts, or scaffolding are needed",
      "Cut-in footage and trim detail, which is labor-dense relative to area",
    ],
    pitfalls: [
      "Bidding from square footage without inspecting surface condition",
      "Assuming one coat covers a color change",
      "Pricing trim at the same rate as open wall area",
      "Leaving masking and protection time out of the labor number",
    ],
    faqs: [
      {
        q: "How do you estimate a painting job?",
        a: "Measure surface area by substrate, decide coat count, and calculate material from spread rate. Price prep labor separately from application labor, add access equipment, then apply overhead, profit, and contingency. Pro Spec IQ tracks square footage and coat count as explicit inputs.",
      },
      {
        q: "How should prep work be priced?",
        a: "Prep is usually best estimated as its own labor line rather than absorbed into a per-square-foot rate, because it varies far more than application does. Keeping it separate also makes it easier to justify if the scope changes after walkthrough.",
      },
      {
        q: "What markups does the painting estimator start with?",
        a: "Painting bids default to 10% overhead, 20% profit, and 5% contingency. Every percentage is editable per bid.",
      },
    ],
  },

  flooring: {
    slug: "flooring",
    headline: "Flooring Estimating & Bidding Software",
    metaDescription:
      "Estimate flooring by square footage, material type, and subfloor prep, with demo, install, and markups per bid.",
    intro:
      "Flooring estimating is area-driven with one large variable: what's under the existing floor. Material and install labor are predictable per square foot; subfloor condition and demo scope are not. Pro Spec IQ prices the measurable work and keeps prep visible rather than buried.",
    costDrivers: [
      "Square footage plus waste, which varies by material and pattern",
      "Material type — tile, hardwood, LVP, and carpet differ in both cost and install hours",
      "Subfloor preparation, including leveling and moisture mitigation",
      "Demolition and disposal of existing flooring",
      "Transitions, thresholds, and trim, which are labor-dense at the edges",
    ],
    pitfalls: [
      "Using one waste percentage across materials and patterns that need different allowances",
      "Bidding subfloor prep blind on a remodel",
      "Forgetting demo and disposal on a tear-out job",
      "Underpricing tile layout in rooms with many cuts",
    ],
    faqs: [
      {
        q: "How do you estimate a flooring job?",
        a: "Measure area by room, add a waste allowance appropriate to the material and pattern, and price material from that. Add demo and disposal, subfloor prep, install labor, and transitions, then apply markups. Pro Spec IQ tracks square footage and material type as separate inputs.",
      },
      {
        q: "How much waste should a flooring estimate include?",
        a: "Waste depends on material, pattern, and room geometry — diagonal and herringbone layouts need more than a straight lay, and cut-up rooms need more than open ones. Pro Spec IQ keeps waste as an input you set rather than a fixed assumption.",
      },
      {
        q: "Can I bid multiple rooms with different materials on one job?",
        a: "Yes. Line items let you break the bid into rooms or areas with their own materials and quantities, all rolling into one total with markups applied at the bid level.",
      },
    ],
  },

  masonry: {
    slug: "masonry",
    headline: "Masonry Estimating & Bidding Software",
    metaDescription:
      "Estimate masonry by unit count, wall area, and mortar, with material, labor, scaffolding, and markups per bid.",
    intro:
      "Masonry is unit-count work with heavy labor and real access cost. Brick and block quantities follow from wall area, but scaffolding, lift equipment, and weather protection can carry a significant share of the bid. Pro Spec IQ tracks units and access separately so neither disappears into a blended rate.",
    costDrivers: [
      "Unit count derived from wall area and the unit size in use",
      "Mortar volume and mix type",
      "Wall height, which drives scaffolding and lift requirements",
      "Reinforcement, ties, and any grouted cells",
      "Cleaning, sealing, and weather protection",
    ],
    pitfalls: [
      "Estimating units without accounting for openings and returns",
      "Omitting scaffolding cost and erection labor on tall walls",
      "Underpricing cleanup and sealing at the end of the job",
      "Not pricing cold-weather protection on late-season work",
    ],
    faqs: [
      {
        q: "How do you estimate masonry work?",
        a: "Calculate wall area net of openings, convert to unit count, and price units and mortar from there. Add scaffolding, reinforcement, and cleaning, apply labor hours at your rate, then layer overhead, profit, and contingency. Pro Spec IQ tracks unit count and wall area as explicit inputs.",
      },
      {
        q: "Should scaffolding be its own line on a masonry bid?",
        a: "Keeping it separate is generally clearer, since it's driven by height and duration rather than by unit count. It also makes the number easier to defend if the schedule changes and the scaffold stays up longer.",
      },
      {
        q: "What defaults does the masonry estimator use?",
        a: "Masonry bids start at 12% overhead, 15% profit, and 7% contingency, all editable per bid.",
      },
    ],
  },

  excavation: {
    slug: "excavation",
    headline: "Excavation Estimating & Bidding Software",
    metaDescription:
      "Estimate excavation by cubic yards, haul distance, and equipment hours, with mobilization and markups per bid.",
    intro:
      "Excavation estimating is equipment-hour work with substantial unknowns below grade. Volume and haul distance give you the base number; soil conditions, groundwater, and unexpected obstructions are what move it. Pro Spec IQ prices the measurable scope and gives contingency real weight.",
    costDrivers: [
      "Cut and fill volume in cubic yards",
      "Haul distance and disposal or import cost",
      "Equipment type and hours, typically the dominant line",
      "Soil conditions, including rock and any required dewatering",
      "Mobilization and demobilization of equipment to the site",
    ],
    pitfalls: [
      "Bidding volume without a geotechnical report or test pits",
      "Omitting mobilization on smaller jobs where it's a large share of cost",
      "Assuming spoil can stay on site when it has to be hauled",
      "Not pricing shoring or dewatering on deep excavations",
    ],
    faqs: [
      {
        q: "How do you estimate an excavation job?",
        a: "Calculate cut and fill volume, determine whether spoil stays on site or hauls off, and price equipment by hours needed. Add mobilization, disposal or import, and any shoring or dewatering, then apply markups. Pro Spec IQ tracks cubic yards, haul distance, and equipment hours as separate inputs.",
      },
      {
        q: "How do you handle unknown subsurface conditions in a bid?",
        a: "Typical approaches are a contingency percentage, unit prices for rock or unsuitable material, and a clear scope exclusion for conditions outside the geotechnical report. Pro Spec IQ defaults excavation bids to 10% contingency, higher than most trades, and every bid carries scope notes.",
      },
      {
        q: "Does it track equipment separately from labor?",
        a: "Yes. Equipment cost and labor hours are distinct fields, which matters on a trade where machine time often exceeds crew cost.",
      },
    ],
  },

  landscaping: {
    slug: "landscaping",
    headline: "Landscaping Estimating & Bidding Software",
    metaDescription:
      "Estimate landscaping by area, plant material, and hardscape, with labor, equipment, and markups on every bid.",
    intro:
      "Landscaping bids mix living material, hardscape, and irrigation — three scopes with different risk profiles in one estimate. Plant material carries warranty exposure the other lines don't. Pro Spec IQ keeps them separate so the bid reflects what each portion actually costs.",
    costDrivers: [
      "Area to be planted, sodded, or seeded",
      "Plant material by size and species, including warranty exposure",
      "Hardscape square footage — patios, walls, and walkways",
      "Irrigation zones, heads, and controller requirements",
      "Soil amendment, grading, and drainage work",
    ],
    pitfalls: [
      "Not pricing plant warranty replacement into the bid",
      "Treating hardscape at landscape labor rates",
      "Missing soil amendment on sites with poor existing soil",
      "Underestimating access constraints for equipment on tight residential lots",
    ],
    faqs: [
      {
        q: "How do you estimate a landscaping job?",
        a: "Break the scope into planting, hardscape, and irrigation, and estimate each on its own units — area for planting and hardscape, zones and heads for irrigation. Add soil work, equipment, and disposal, then apply markups. Pro Spec IQ tracks these as separate inputs so each scope is visible.",
      },
      {
        q: "Should plant warranty be included in the bid?",
        a: "If you're offering a replacement warranty, the exposure belongs in the estimate — either as a line item or through contingency. Leaving it out means replacements come straight out of margin.",
      },
      {
        q: "Can I bid maintenance contracts as well as installs?",
        a: "The estimator is built for project work, but recurring scopes can be bid as jobs with their own line items. Job tracking then carries through to invoicing.",
      },
    ],
  },

  insulation: {
    slug: "insulation",
    headline: "Insulation Estimating & Bidding Software",
    metaDescription:
      "Estimate insulation by square footage, R-value, and material type, with labor and markups calculated per bid.",
    intro:
      "Insulation estimating is area and R-value work, with install method driving most of the labor difference. Batt, blown, and spray foam price and install very differently at identical coverage. Pro Spec IQ makes material type an explicit input so the labor follows the method rather than an average.",
    costDrivers: [
      "Square footage of wall, ceiling, and floor area to be covered",
      "Required R-value, which sets thickness and material quantity",
      "Material type — batt, blown, rigid, or spray foam",
      "Cavity depth and framing spacing",
      "Air sealing scope, which is often bid alongside but priced separately",
    ],
    pitfalls: [
      "Using one labor rate across batt and spray foam",
      "Missing air sealing scope that the energy code requires",
      "Not accounting for access difficulty in attics and crawlspaces",
      "Estimating from floor area rather than actual surface area to be covered",
    ],
    faqs: [
      {
        q: "How do you estimate an insulation job?",
        a: "Measure the actual surface area to be insulated, confirm the required R-value, and select material type. Price material from area and thickness, apply labor hours appropriate to the install method, add equipment, then apply markups. Pro Spec IQ tracks area, R-value, and material type as separate inputs.",
      },
      {
        q: "Does install method really change the estimate that much?",
        a: "Yes. Batt, blown, and spray foam differ in both material cost and the hours and equipment required, so a single blended per-square-foot rate tends to overprice some jobs and underprice others.",
      },
      {
        q: "What markups does the insulation estimator start with?",
        a: "Insulation bids default to 10% overhead, 18% profit, and 5% contingency, all editable.",
      },
    ],
  },

  welding: {
    slug: "welding",
    headline: "Welding & Fabrication Estimating Software",
    metaDescription:
      "Estimate welding and fabrication by weld inches, material weight, and shop hours, with labor and markups per bid.",
    intro:
      "Welding and fabrication estimates combine material weight with highly skilled labor hours, and often split between shop and field. Field work carries access, positioning, and inspection cost that shop work doesn't. Pro Spec IQ separates the inputs so a bid reflects where the work actually happens.",
    costDrivers: [
      "Material weight and type, including any specialty alloys",
      "Weld inches or joint count, and the process required",
      "Shop hours versus field hours, which carry different effective rates",
      "Inspection and certification requirements",
      "Rigging, positioning, and access on field installs",
    ],
    pitfalls: [
      "Pricing field welding at shop rates",
      "Omitting inspection and NDT cost on structural work",
      "Missing rigging and crane time on installed assemblies",
      "Underestimating fit-up hours relative to actual welding time",
    ],
    faqs: [
      {
        q: "How do you estimate welding and fabrication work?",
        a: "Take off material by weight and type, estimate weld inches or joints, and split hours between shop and field. Add consumables, inspection, and rigging, then apply overhead, profit, and contingency. Pro Spec IQ keeps material, labor hours, and equipment as separate inputs.",
      },
      {
        q: "Should shop and field labor use different rates?",
        a: "Usually yes. Field work carries travel, access, positioning, and often inspection overhead that shop work doesn't, so a single blended rate tends to underprice field-heavy jobs.",
      },
      {
        q: "Can I bid fabrication and installation as one job?",
        a: "Yes. Line items let you separate shop fabrication from field installation within a single bid, with markups applied at the bid level.",
      },
    ],
  },

  demolition: {
    slug: "demolition",
    headline: "Demolition Estimating & Bidding Software",
    metaDescription:
      "Estimate demolition by area, debris volume, and disposal, with equipment, labor, and markups on every bid.",
    intro:
      "Demolition estimating is driven by disposal as much as by the work itself. Debris volume, haul distance, and tipping fees frequently exceed the labor to take something apart — and hazardous material assessment can reshape the entire bid. Pro Spec IQ prices removal and disposal separately.",
    costDrivers: [
      "Area or volume to be demolished",
      "Debris volume and the number of hauls required",
      "Disposal and tipping fees, which vary by material and facility",
      "Equipment type and hours",
      "Hazardous material abatement, where asbestos or lead is present",
    ],
    pitfalls: [
      "Underestimating debris volume and the resulting haul count",
      "Bidding before a hazardous material survey on any older structure",
      "Missing protection and shoring cost on selective interior demo",
      "Omitting utility disconnect coordination",
    ],
    faqs: [
      {
        q: "How do you estimate a demolition job?",
        a: "Determine what's being removed and estimate resulting debris volume, then price hauling and disposal from that. Add equipment hours, labor, protection and shoring, and any abatement, then apply markups. Pro Spec IQ tracks area, debris volume, and disposal as separate inputs.",
      },
      {
        q: "Why does disposal deserve its own line?",
        a: "On many demolition jobs, hauling and tipping fees are a larger share of cost than the labor to demolish. Separating them makes the bid easier to adjust when material quantities or facility rates change.",
      },
      {
        q: "How should hazardous materials be handled in a bid?",
        a: "Abatement is normally scoped and priced separately after a survey, and excluded from the base demolition bid until the survey is complete. Pro Spec IQ supports scope notes and exclusions on every bid.",
      },
    ],
  },

  general: {
    slug: "general",
    headline: "General Contractor Bidding Software",
    metaDescription:
      "Build multi-trade project bids as a GC — combine sub bids across trades with insurance, permits, management fee, and markups.",
    intro:
      "A general contractor's bid is an assembly problem, not a takeoff problem. The work is collecting sub bids across trades, adding the costs only the GC carries, and applying a management fee and markups to the whole. Pro Spec IQ is built around that shape: select the trades on a project and each gets its own section rolling into one total.",
    costDrivers: [
      "Sub bids across every trade on the project",
      "General conditions, including supervision and site costs",
      "Insurance and bonding, carried at the project level",
      "Permits and jurisdictional fees",
      "Management fee applied across the combined scope",
    ],
    pitfalls: [
      "Carrying sub bids at face value without scope-gap review between trades",
      "Missing general conditions on longer-duration projects",
      "Applying a single markup without separating management fee from profit",
      "Not tracking which sub bids are firm and which are budgetary",
    ],
    faqs: [
      {
        q: "How does a GC build a multi-trade bid?",
        a: "Select the trades on the project and enter each sub bid in its own section. Add GC-carried costs — insurance, permits, general conditions — then apply a management fee, overhead, profit, and contingency to the combined total. Pro Spec IQ generates a section per selected trade automatically.",
      },
      {
        q: "What's the difference between the GC and trade account types?",
        a: "Trade accounts bid a single scope with inputs specific to that trade. GC accounts select multiple trades on one project, get a line-item section for each, and add project-level costs like insurance and management fee on top.",
      },
      {
        q: "Can I track subcontractors after the bid?",
        a: "Yes. Accepted bids convert to jobs with change orders, daily logs, and budget-versus-actual tracking, and subcontractor records carry through.",
      },
    ],
  },
};

export const TRADE_SLUGS = Object.keys(TRADE_CONTENT) as TradeType[];

export function getTradeContent(slug: string): TradeContent | null {
  return TRADE_CONTENT[slug as TradeType] ?? null;
}
