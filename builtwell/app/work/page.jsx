import Link from "next/link";

export const metadata = {
  title: "Work — OutpostIQ Case Study",
  description:
    "Proof over promises: OutpostIQ, a full profitability-modeling SaaS for restaurants, designed, built, and run by Builtwell AI's founder.",
};

export default function WorkPage() {
  return (
    <main className="page">
      <div className="wrap-narrow">
        <div className="eyebrow">Case study</div>
        <h1>OutpostIQ: a real product, not a portfolio mockup</h1>
        <p className="lede">
          The strongest thing an AI consultant can show you isn&rsquo;t a testimonial —
          it&rsquo;s live software with paying-customer problems solved. OutpostIQ is ours.
        </p>

        <h2>The problem</h2>
        <p>
          Restaurant operators fly blind on profitability. Food costs move weekly, labor is
          the biggest controllable line, and by the time the monthly P&amp;L arrives from
          the bookkeeper, the damage is four weeks old. Owners needed a way to model
          decisions — a price change, a new hire, a menu swap — before making them.
        </p>

        <h2>What we built</h2>
        <ul>
          <li>
            A <strong>profitability modeling and what-if engine</strong>: change any
            assumption — menu price, portion cost, staffing — and watch it flow through to
            the bottom line instantly.
          </li>
          <li>
            A <strong>full SaaS platform</strong> around it: accounts, authentication,
            subscription billing, and a content engine targeting the searches operators
            actually make.
          </li>
        </ul>

        <h2>Why it matters for your project</h2>
        <p>
          It was born inside a real operation — Builtwell&rsquo;s founder co-founded and
          runs strategy and systems for a three-location restaurant group in Athens, and
          OutpostIQ grew out of the tools built to run it. The same discipline applies to
          client work: software has to survive contact with a Tuesday dinner rush, not just
          a demo.
        </p>
        <p>
          The stack behind OutpostIQ — the same one we build client projects on — is modern,
          boring in the best way, and cheap to run: the point is a tool that works for
          years, not a science project.
        </p>

        <h2>See it live</h2>
        <p>
          OutpostIQ is a live product at{" "}
          <a href="https://outpostiq.com" target="_blank" rel="noopener noreferrer">
            outpostiq.com
          </a>
          . Poke around — it&rsquo;s the closest thing to a reference call you can do at
          11pm.
        </p>

        <p style={{ marginTop: 40 }}>
          <Link href="/contact" className="btn btn-primary">
            Talk about your project
          </Link>
        </p>
      </div>
    </main>
  );
}
