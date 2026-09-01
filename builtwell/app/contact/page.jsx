export const metadata = {
  title: "Contact — Book a Free Fit Call",
  description:
    "Book a free 20-minute fit call with Builtwell AI. Athens & Atlanta in person, remote anywhere. No pitch deck, just a candid read on whether a build is worth it.",
};

export default function ContactPage() {
  return (
    <main className="page">
      <div className="wrap-narrow">
        <div className="eyebrow">Contact</div>
        <h1>Twenty minutes. No pitch deck.</h1>
        <p className="lede">
          Tell us what eats your time or clouds your numbers. We&rsquo;ll tell you —
          candidly — whether a build is worth it, what it would roughly cost, and what
          we&rsquo;d do first. If we&rsquo;re not the right fit, we&rsquo;ll say so and
          point you somewhere better.
        </p>

        <h2>Email</h2>
        <p>
          <a href="mailto:hello@builtwellai.com">hello@builtwellai.com</a> — two or three
          sentences about your business and what&rsquo;s bugging you is plenty. You&rsquo;ll
          hear back within one business day.
        </p>

        <h2>What to expect on the call</h2>
        <ul>
          <li>Ten minutes on how your business runs and where the friction is.</li>
          <li>Five minutes of us telling you what we&rsquo;d do — including &ldquo;nothing yet.&rdquo;</li>
          <li>Five minutes on price, timeline, and next steps, only if it makes sense.</li>
        </ul>

        <h2>Local?</h2>
        <p>
          If you&rsquo;re in Athens or metro Atlanta, we&rsquo;re happy to come to you —
          audits work best where the work actually happens.
        </p>
      </div>
    </main>
  );
}
