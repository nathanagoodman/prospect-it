/**
 * Line-art icon set for trades and app navigation.
 *
 * ─── Why this replaced emoji ───────────────────────────────────────────
 *
 * Trades and nav items were labelled with emoji. Three problems:
 *
 *   1. They weren't unique. Framing and Flooring were both 🪵; Masonry and
 *      Concrete were both 🧱. Four trades, two glyphs — so the icon
 *      couldn't actually identify the trade.
 *   2. Emoji are rendered by the operating system, not by us. A contractor
 *      on Windows saw different artwork than one on a Mac or Android, and
 *      none of it matched the brand.
 *   3. They read as consumer software in a product a contractor is
 *      supposed to put in front of a client.
 *
 * These are stroke-only, sized in a 24x24 box, and inherit `currentColor`,
 * so a parent's text color controls them and they work on light or dark
 * surfaces without a second variant.
 */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Svg({ children, className = "w-6 h-6", ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ─── Trades ─────────────────────────────────────────────────────────── */

// Hard hat — the general contractor running the whole job.
const General = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 17a7 7 0 0 1 14 0" />
    <path d="M3 17h18" />
    <path d="M12 10v7" />
    <path d="M9 10.8V17" />
    <path d="M15 10.8V17" />
  </Svg>
);

const Electrical = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </Svg>
);

// A run of pipe with an inline valve.
const Plumbing = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 14h18" />
    <path d="M7 11v6" />
    <path d="M17 11v6" />
    <path d="M12 14V7" />
    <path d="M9 7h6" />
  </Svg>
);

// Moving air.
const Hvac = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8h12a3 3 0 1 0-3-3" />
    <path d="M3 12h15a3 3 0 1 1-3 3" />
    <path d="M3 16h9" />
  </Svg>
);

// Roof plane with shingle courses.
const Roofing = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 13 12 5l10 8" />
    <path d="M5 15.5h14" />
    <path d="M7 18.5h10" />
  </Svg>
);

// Slab with aggregate.
const Concrete = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 9h14" />
    <rect x="3" y="13" width="18" height="7" rx="1" />
    <circle cx="8" cy="16.5" r=".9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="16.5" r=".9" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16.5" r=".9" fill="currentColor" stroke="none" />
  </Svg>
);

// Studs between top and bottom plates.
const Framing = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 4h18" />
    <path d="M3 20h18" />
    <path d="M7 4v16" />
    <path d="M12 4v16" />
    <path d="M17 4v16" />
  </Svg>
);

const Painting = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="12" height="5" rx="1" />
    <path d="M15 6.5h3a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1h-6" />
    <path d="M12 12v3" />
    <rect x="10" y="15" width="4" height="6" rx="1" />
  </Svg>
);

const Landscaping = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18" />
    <path d="M12 21v-6" />
    <path d="M7 15l5-6 5 6z" />
    <path d="M8.5 10 12 5l3.5 5" />
  </Svg>
);

// Two boards meeting at a taped seam.
const Drywall = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="1" />
    <path d="M12 4v16" />
    <circle cx="7.5" cy="8" r=".8" fill="currentColor" stroke="none" />
    <circle cx="7.5" cy="16" r=".8" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="8" r=".8" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="16" r=".8" fill="currentColor" stroke="none" />
  </Svg>
);

// Long planks, staggered end joints.
const Flooring = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="1" />
    <path d="M3 9.33h18" />
    <path d="M3 14.67h18" />
    <path d="M9 4v5.33" />
    <path d="M15 9.33v5.34" />
    <path d="M9 14.67V20" />
  </Svg>
);

// Running bond — offset from Flooring so the two don't read alike.
const Masonry = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="M3 9.67h18" />
    <path d="M3 14.33h18" />
    <path d="M9 5v4.67" />
    <path d="M15 5v4.67" />
    <path d="M6 9.67v4.66" />
    <path d="M12 9.67v4.66" />
    <path d="M18 9.67v4.66" />
    <path d="M9 14.33V19" />
    <path d="M15 14.33V19" />
  </Svg>
);

// Torch throwing sparks.
const Welding = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 3l-7 7" />
    <path d="M14.5 7.5 17 10" />
    <path d="M11 13.5 8.5 16" />
    <path d="M12.5 11.5 10 9" />
    <path d="M9 18.5 8 21" />
    <path d="M6 15.5 3.5 16.5" />
    <path d="M12.5 18.5 13.5 21" />
  </Svg>
);

const Demolition = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 6.5l4-4 5 5-4 4z" />
    <path d="M9 11l10 10" />
    <path d="M17 19l3-3" />
  </Svg>
);

// Shovel.
const Excavation = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 3h4v3h-4z" />
    <path d="M12 6v10" />
    <path d="M9 16h6v2a3 3 0 0 1-6 0z" />
  </Svg>
);

// Batt insulation between studs.
const Insulation = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 3v18" />
    <path d="M19 3v18" />
    <path d="M5 7c3.5 2.5 10.5-2.5 14 0" />
    <path d="M5 12c3.5 2.5 10.5-2.5 14 0" />
    <path d="M5 17c3.5 2.5 10.5-2.5 14 0" />
  </Svg>
);

const TRADE_ICON_MAP: Record<string, (p: IconProps) => React.ReactElement> = {
  general: General,
  electrical: Electrical,
  plumbing: Plumbing,
  hvac: Hvac,
  roofing: Roofing,
  concrete: Concrete,
  framing: Framing,
  painting: Painting,
  landscaping: Landscaping,
  drywall: Drywall,
  flooring: Flooring,
  masonry: Masonry,
  welding: Welding,
  demolition: Demolition,
  excavation: Excavation,
  insulation: Insulation,
};

export const TRADE_ICON_KEYS = Object.keys(TRADE_ICON_MAP);

/**
 * Renders the icon for a trade. Falls back to the general-contractor hard
 * hat for anything unrecognised, so a new trade key can never render an
 * empty box. Trade keys arrive from the database in mixed case, so this
 * normalises before lookup.
 */
export function TradeIcon({
  trade,
  className = "w-6 h-6",
  ...rest
}: { trade: string | null | undefined } & IconProps) {
  const Icon = TRADE_ICON_MAP[(trade ?? "").toLowerCase()] ?? General;
  return <Icon className={className} {...rest} />;
}

/* ─── App navigation ─────────────────────────────────────────────────── */

const NavDashboard = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18" />
    <path d="M6 21v-7" />
    <path d="M12 21V9" />
    <path d="M18 21v-5" />
  </Svg>
);

const NavBids = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </Svg>
);

const NavInvoices = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 2h14v20l-2.5-2-2.5 2-2-2-2 2-2.5-2L5 22z" />
    <path d="M12 7v10" />
    <path d="M14.5 9.5h-4a1.75 1.75 0 0 0 0 3.5h3a1.75 1.75 0 0 1 0 3.5h-4" />
  </Svg>
);

const NavJobs = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 3.5 21 10l-3 3-6.5-6.5z" />
    <path d="M11.5 6.5 3 15v6h6l8.5-8.5" />
  </Svg>
);

const NavClients = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

const NavSubs = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 10a6 6 0 0 1 12 0" />
    <path d="M4 10h16" />
    <path d="M12 4v6" />
    <path d="M20 21v-1.5a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4V21" />
  </Svg>
);

const NavSettings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Svg>
);

const NavLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </Svg>
);

const NavLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <path d="M12 14.5v2.5" />
  </Svg>
);

const NAV_ICON_MAP: Record<string, (p: IconProps) => React.ReactElement> = {
  settings: NavSettings,
  logout: NavLogout,
  lock: NavLock,
  dashboard: NavDashboard,
  bids: NavBids,
  invoices: NavInvoices,
  jobs: NavJobs,
  clients: NavClients,
  subs: NavSubs,
};

export function NavIcon({
  name,
  className = "w-5 h-5",
  ...rest
}: { name: string } & IconProps) {
  const Icon = NAV_ICON_MAP[name.toLowerCase()] ?? NavDashboard;
  return <Icon className={className} {...rest} />;
}
