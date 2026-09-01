import "./globals.css";
import Link from "next/link";

export const metadata = {
  metadataBase: new URL("https://builtwellai.com"),
  title: {
    default: "Builtwell AI — Custom AI Tools & Dashboards for Small Business | Athens, GA",
    template: "%s | Builtwell AI",
  },
  description:
    "Athens, Georgia AI consultancy that builds working software for small businesses — dashboards, automations, and custom AI tools at fixed prices. Serving Athens, Atlanta, and remote clients.",
  openGraph: {
    siteName: "Builtwell AI",
    type: "website",
    locale: "en_US",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Builtwell AI",
  description:
    "AI consulting and custom software for small businesses: dashboards, automations, and AI tools built at fixed prices.",
  url: "https://builtwellai.com",
  email: "hello@builtwellai.com",
  areaServed: [
    { "@type": "City", name: "Athens", containedInPlace: { "@type": "State", name: "Georgia" } },
    { "@type": "City", name: "Atlanta", containedInPlace: { "@type": "State", name: "Georgia" } },
    { "@type": "Country", name: "United States" },
  ],
  address: { "@type": "PostalAddress", addressLocality: "Athens", addressRegion: "GA", addressCountry: "US" },
  founder: { "@type": "Person", name: "Nathan Goodman" },
  priceRange: "$$",
  knowsAbout: [
    "AI consulting",
    "business dashboards",
    "workflow automation",
    "custom software development",
    "small business technology",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="logo">
              Builtwell<b>&nbsp;AI</b>
            </Link>
            <nav className="main-nav">
              <Link href="/services/ai-opportunity-audit">Audit</Link>
              <Link href="/services/dashboard-build">Dashboards</Link>
              <Link href="/services/custom-ai">Custom Builds</Link>
              <Link href="/work">Work</Link>
              <Link href="/about">About</Link>
              <Link href="/contact" className="cta">
                Book a fit call
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="wrap">
            <div>
              <div className="foot-brand">Builtwell AI</div>
              <div>Custom AI tools &amp; dashboards for small business</div>
              <div>Athens, Georgia · serving Athens, Atlanta &amp; remote</div>
              <div>
                <a href="mailto:hello@builtwellai.com">hello@builtwellai.com</a>
              </div>
            </div>
            <nav>
              <Link href="/services/ai-opportunity-audit">AI Opportunity Audit</Link>
              <Link href="/services/dashboard-build">Dashboard Build</Link>
              <Link href="/services/custom-ai">Custom AI Solutions</Link>
              <Link href="/work">Work</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
