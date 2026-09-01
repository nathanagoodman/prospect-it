import Link from "next/link";

export const metadata = {
  title: "Business Dashboard Build — Your Numbers, Live, In One Place",
  description:
    "Fixed-price dashboard builds for small businesses: sales, costs, labor, and inventory pulled automatically from your POS, books, and spreadsheets. From $6,500, live in 3–4 weeks.",
};

export default function DashboardPage() {
  return (
    <main className="page">
      <div className="wrap-narrow">
        <div className="eyebrow">Flagship · from $6,500 · 3–4 weeks</div>
        <h1>The Dashboard Build</h1>
        <p className="lede">
          Most owners run their business on a POS report, a bookkeeping export, three
          spreadsheets, and a feeling. The Dashboard Build replaces that with one screen
          that tells you, every morning, how the business is actually doing.
        </p>
        <p className="meta-line">
          Fixed scope agreed up front. Wired to the systems you already use. Built for the
          person who owns the P&amp;L, not for an analyst you don&rsquo;t have.
        </p>

        <h2>What we build</h2>
        <ul>
          <li>
            <strong>Live pulls from your real systems</strong> — POS, QuickBooks or your
            bookkeeper&rsquo;s exports, scheduling tools, inventory sheets, e-commerce
            platforms.
          </li>
          <li>
            <strong>The metrics that drive your decisions</strong> — daily sales vs. target,
            cost ratios, labor as a percent of revenue, margin by product or service line,
            whatever your business turns on.
          </li>
          <li>
            <strong>Alerts, not homework</strong> — when a number drifts out of range, the
            dashboard tells you. You shouldn&rsquo;t have to go looking.
          </li>
        </ul>

        <h2>Where AI fits</h2>
        <p>
          Where it earns its place: plain-English summaries of the week, anomaly flags that
          catch a supplier price creep or a labor spike, and what-if projections. Where it
          doesn&rsquo;t, we leave it out — a dashboard&rsquo;s first job is to be right.
        </p>

        <h2>Why fixed price</h2>
        <p>
          Because &ldquo;hourly, open-ended&rdquo; is how small businesses get burned on
          software. You get a written scope and a number before we start. If you want more
          later, that&rsquo;s a new number you approve first.
        </p>

        <h2>Credibility, concretely</h2>
        <p>
          This is the work we know best. Builtwell&rsquo;s founder built{" "}
          <Link href="/work">OutpostIQ</Link>, a full profitability-modeling SaaS for
          restaurants, and runs strategy and systems for a multi-location restaurant group —
          so the dashboards come from someone who has actually managed a P&amp;L off one.
        </p>

        <p style={{ marginTop: 40 }}>
          <Link href="/contact" className="btn btn-primary">
            Book a fit call
          </Link>
        </p>
      </div>
    </main>
  );
}
