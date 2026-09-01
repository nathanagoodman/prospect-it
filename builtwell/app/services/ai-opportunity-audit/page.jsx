import Link from "next/link";

export const metadata = {
  title: "AI Opportunity Audit for Small Business — $750, One Week",
  description:
    "A one-week, fixed-price audit that finds where AI and automation actually pay off in your business. Athens & Atlanta in person, remote anywhere. Roadmap is yours to keep.",
};

export default function AuditPage() {
  return (
    <main className="page">
      <div className="wrap-narrow">
        <div className="eyebrow">Start here · $750 · one week</div>
        <h1>The AI Opportunity Audit</h1>
        <p className="lede">
          Every small business owner is being told to &ldquo;use AI.&rdquo; Almost nobody is
          telling them <em>where</em> it pays off in their specific operation — and where
          it&rsquo;s a waste of money. That&rsquo;s what this is.
        </p>
        <p className="meta-line">
          Fixed price. One week. In person around Athens and Atlanta, on a call anywhere
          else. The deliverable is yours whoever you hire next — including nobody.
        </p>

        <h2>What happens</h2>
        <p>
          We spend time inside your operation: how orders come in, how work gets scheduled,
          where the numbers live, what your team retypes, rechecks, or reconciles by hand.
          Then we score the opportunities — by dollars saved or earned, not by novelty.
        </p>

        <h2>What you get</h2>
        <ul>
          <li>
            <strong>3–5 scored opportunities</strong> — each with the estimated payoff, the
            realistic cost, and the time to live.
          </li>
          <li>
            <strong>Honest build-vs-buy calls</strong> — when a $40/month off-the-shelf tool
            beats a custom build, we say so. When a spreadsheet is enough, we say that too.
          </li>
          <li>
            <strong>A prioritized roadmap</strong> — a plain-English document your banker,
            your partner, or another developer could act on.
          </li>
        </ul>

        <h2>Why it&rsquo;s priced this way</h2>
        <p>
          $750 is deliberately low enough that a solo operator can buy it and high enough
          that we can do it properly. It is not a disguised sales call: most audits
          recommend at least one thing we don&rsquo;t sell. If a build <em>is</em> the right
          answer, the audit fee is credited toward it.
        </p>

        <h2>Who it&rsquo;s for</h2>
        <p>
          Owners and operators of small businesses — restaurants, retail, trades,
          professional services — from solo shops to teams of fifty. If you&rsquo;ve got a
          gut feeling that your business runs on too much manual work and too little
          visibility, this is the cheapest way to find out what&rsquo;s true.
        </p>

        <p style={{ marginTop: 40 }}>
          <Link href="/contact" className="btn btn-primary">
            Book an Audit
          </Link>
        </p>
      </div>
    </main>
  );
}
