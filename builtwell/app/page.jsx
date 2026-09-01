import Link from "next/link";

export const metadata = {
  title: "Builtwell AI — Custom AI Tools & Dashboards for Small Business | Athens, GA",
  description:
    "We build working software for small businesses — dashboards, automations, and AI tools at fixed prices, delivered in weeks. Based in Athens, GA. Serving Athens, Atlanta, and remote.",
};

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="eyebrow">Athens, Georgia · AI consulting that ships software</div>
          <h1>Your business runs on guesswork it doesn&rsquo;t have to.</h1>
          <p className="lede">
            Builtwell AI designs and builds the tools small businesses actually use — live
            dashboards, automations, and custom AI solutions — scoped to a fixed price and
            delivered in weeks, not quarters. No slide decks. No open-ended retainers.
            Working software, built well.
          </p>
          <div className="btn-row">
            <Link href="/contact" className="btn btn-primary">
              Book a free 20-minute fit call
            </Link>
            <Link href="/work" className="btn btn-ghost">
              See what we build
            </Link>
          </div>
        </div>
      </section>

      <section className="band alt" id="services">
        <div className="wrap">
          <div className="kicker">Services</div>
          <h2>Start small. Scale when it pays for itself.</h2>
          <p className="sub">
            Every engagement is fixed-scope and fixed-price, so you know exactly what
            you&rsquo;re buying before we start. Most clients begin with the Audit and move
            up only when the numbers justify it.
          </p>
          <div className="tiers">
            <div className="tier">
              <div className="tag">Start here</div>
              <h3>AI Opportunity Audit</h3>
              <div className="price">$750 · one week</div>
              <p>
                We sit down with your operation — in person around Athens, on a call
                anywhere — and find the places where AI or automation actually pays for
                itself.
              </p>
              <ul>
                <li>Walkthrough of your workflows, tools, and data</li>
                <li>3–5 scored opportunities with honest build-vs-buy calls</li>
                <li>A prioritized roadmap that&rsquo;s yours to keep, whoever you hire</li>
              </ul>
              <Link href="/services/ai-opportunity-audit" className="tier-link">
                About the Audit →
              </Link>
            </div>
            <div className="tier flagship">
              <div className="tag">Flagship</div>
              <h3>Dashboard Build</h3>
              <div className="price">From $6,500 · 3–4 weeks</div>
              <p>
                Your numbers — sales, costs, labor, inventory — live in one place, pulled
                automatically from the systems you already use.
              </p>
              <ul>
                <li>Wired to your POS, books, or spreadsheets</li>
                <li>The metrics that drive your decisions, updated daily</li>
                <li>Built for owners and managers, not analysts</li>
              </ul>
              <Link href="/services/dashboard-build" className="tier-link">
                About Dashboard Builds →
              </Link>
            </div>
            <div className="tier">
              <div className="tag">Custom</div>
              <h3>Custom AI Solution</h3>
              <div className="price">From $12,500 · scoped per project</div>
              <p>
                A tool built around one job your business does every day — quoting,
                scheduling, document handling, customer follow-up — done faster and better.
              </p>
              <ul>
                <li>Fixed quote after a paid scoping sprint</li>
                <li>Weekly working demos, not status reports</li>
                <li>You own the code and the accounts</li>
              </ul>
              <Link href="/services/custom-ai" className="tier-link">
                About Custom Builds →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="kicker">Proof, not promises</div>
          <h2>We ship our own products too.</h2>
          <p className="sub">
            Most AI consultants have never launched software. Builtwell is run by a builder
            who has.
          </p>
          <div className="proof-card">
            <div>
              <h3>OutpostIQ — restaurant profitability, modeled live</h3>
              <p>
                A full SaaS product we designed, built, and run: financial modeling and
                what-if analysis for restaurant operators, from food cost to labor to the
                bottom line. Built on the same stack we use for client work.
              </p>
              <Link href="/work">Read the case study →</Link>
            </div>
            <div className="proof-stats">
              <div className="stat">
                <b>Full-stack SaaS</b>
                <span>Auth, billing, and modeling engine — designed and shipped end to end</span>
              </div>
              <div className="stat">
                <b>Operator-built</b>
                <span>Born inside a real three-location restaurant group</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap">
          <div className="kicker">How it works</div>
          <h2>Three steps. No mystery.</h2>
          <div className="steps" style={{ marginTop: 32 }}>
            <div className="step">
              <h3>Scope</h3>
              <p>
                A free 20-minute fit call, then a written fixed quote: what we&rsquo;ll
                build, what it costs, when it lands. If we&rsquo;re not the right fit,
                we&rsquo;ll say so and point you somewhere better.
              </p>
            </div>
            <div className="step">
              <h3>Build</h3>
              <p>
                You see working software every week, not a status report. Scope changes are
                priced before they happen — never discovered on an invoice.
              </p>
            </div>
            <div className="step">
              <h3>Run</h3>
              <p>
                We hand over the keys: your accounts, your data, your code, plus training
                for your team. Optional care plan if you want us on call.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="local">
            <div>
              <div className="kicker">Local first</div>
              <h2>An AI consultant you can actually meet.</h2>
              <p>
                Builtwell is based in Athens, Georgia and works face-to-face with businesses
                across the Classic City and metro Atlanta — restaurants, retail, trades,
                professional services, and everyone in between.
              </p>
              <p>
                Remote clients are welcome too. The work is the same; the sweet tea is on
                you.
              </p>
            </div>
            <div className="faq">
              <details>
                <summary>Do I need to be &ldquo;technical&rdquo; to work with you?</summary>
                <p>
                  No. Our job is translating your operation into software, not making you
                  learn ours. If you can describe how your business runs, we can build for
                  it.
                </p>
              </details>
              <details>
                <summary>What if AI isn&rsquo;t actually the answer for my business?</summary>
                <p>
                  Then the Audit says so, in writing. Sometimes the honest recommendation is
                  a $40/month off-the-shelf tool or a better spreadsheet — and you keep the
                  roadmap either way.
                </p>
              </details>
              <details>
                <summary>Who owns what you build?</summary>
                <p>
                  You do. Code, accounts, and data are in your name from day one. No lock-in
                  and no hostage-taking.
                </p>
              </details>
              <details>
                <summary>How is this different from hiring an agency?</summary>
                <p>
                  Fixed scope, fixed price, and a builder who has shipped his own products —
                  not a pitch team that hands you off to juniors after the contract signs.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <h2>Twenty minutes. No pitch deck.</h2>
          <p>
            Tell us what eats your time or clouds your numbers, and we&rsquo;ll tell you —
            candidly — whether a build is worth it.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Book a free fit call
          </Link>
        </div>
      </section>
    </main>
  );
}
