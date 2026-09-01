import Link from "next/link";

export const metadata = {
  title: "About — An Operator Who Builds",
  description:
    "Builtwell AI is run by Nathan Goodman: restaurant group co-founder, SaaS builder, and MBA — an operator who builds software, based in Athens, GA.",
};

export default function AboutPage() {
  return (
    <main className="page">
      <div className="wrap-narrow">
        <div className="eyebrow">About</div>
        <h1>An operator who builds, not a consultant who talks.</h1>
        <p className="lede">
          Builtwell AI is run by Nathan Goodman in Athens, Georgia. The short version: he
          runs a real multi-location business, ships his own software, and brings both to
          your project.
        </p>

        <h2>The longer version</h2>
        <p>
          Nathan co-founded Maepole, a healthy fast-casual restaurant group in Athens, and
          leads its strategy and systems — the P&amp;L, the analytics, the operational
          tooling across three locations. That work is where Builtwell&rsquo;s worldview
          comes from: small businesses don&rsquo;t need AI strategy decks; they need working
          tools that make Tuesday easier and the numbers clearer.
        </p>
        <p>
          Building those tools internally led to <Link href="/work">OutpostIQ</Link>, a
          profitability-modeling SaaS for restaurant operators — designed, coded, and
          launched as a full product with billing, auth, and a content engine. He holds an
          MBA from Boston University&rsquo;s Questrom School of Business, which mostly means
          the dashboards come with someone who can read your financials, not just your
          data.
        </p>

        <h2>What Builtwell believes</h2>
        <ul>
          <li>
            <strong>Fixed prices are respect.</strong> You should know the cost of a thing
            before you buy it. Radical, we know.
          </li>
          <li>
            <strong>The honest answer sells better.</strong> If a $40 tool or a better
            spreadsheet beats a custom build, that&rsquo;s the recommendation.
          </li>
          <li>
            <strong>You own everything.</strong> Code, accounts, data. A consultant who
            locks you in is charging rent on your own business.
          </li>
          <li>
            <strong>Local matters.</strong> Athens and Atlanta businesses get a consultant
            who shows up in person and answers when a neighbor asks about him.
          </li>
        </ul>

        <p style={{ marginTop: 40 }}>
          <Link href="/contact" className="btn btn-primary">
            Book a fit call
          </Link>
        </p>
      </div>
    </main>
  );
}
