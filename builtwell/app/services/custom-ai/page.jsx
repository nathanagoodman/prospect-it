import Link from "next/link";

export const metadata = {
  title: "Custom AI Solutions for Small Business — Fixed-Scope Builds",
  description:
    "Custom AI tools and automations built around one job your business does every day — quoting, scheduling, document handling, follow-up. Fixed quotes from $12,500. You own the code.",
};

export default function CustomAiPage() {
  return (
    <main className="page">
      <div className="wrap-narrow">
        <div className="eyebrow">Custom · from $12,500 · scoped per project</div>
        <h1>Custom AI Solutions</h1>
        <p className="lede">
          Not a chatbot bolted onto your website. A tool built around one specific job your
          business does every day — the one that eats hours, causes errors, or bottlenecks
          on a single person — done faster, more consistently, and without the retyping.
        </p>
        <p className="meta-line">
          Every custom build starts with a paid scoping sprint that produces a fixed quote.
          You own the code, the accounts, and the data from day one.
        </p>

        <h2>The kinds of jobs we build for</h2>
        <ul>
          <li>
            <strong>Quoting and estimating</strong> — turn a customer email or a site photo
            into a draft quote in your format, priced from your actual rules.
          </li>
          <li>
            <strong>Document handling</strong> — invoices, POs, applications, and intake
            forms read, checked, and filed without a human retyping them.
          </li>
          <li>
            <strong>Scheduling and dispatch</strong> — the constraints in your head, encoded
            so the schedule builds itself and you just approve it.
          </li>
          <li>
            <strong>Customer follow-up</strong> — quotes chased, reviews requested,
            appointments confirmed, in your voice, with a human in the loop.
          </li>
        </ul>

        <h2>How scoping works</h2>
        <p>
          Custom software has a bad reputation with small businesses for a reason: vague
          scope, hourly billing, moving targets. We do the opposite. A short paid scoping
          sprint produces a written spec and a fixed quote. If the number doesn&rsquo;t make
          sense for your business, you walk away with the spec — which any competent
          developer could build from.
        </p>

        <h2>Built to be run without us</h2>
        <p>
          Every build ships with handover: documentation, training for your team, and your
          own accounts for every service involved. An optional care plan keeps us on call,
          but you are never locked in — that&rsquo;s a design requirement, not a promise.
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
