import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://www.prospeciq.com"
).replace(/\/$/, "");

const TITLE = "Pro Spec IQ — Bid Smarter. Build Bigger.";
const DESCRIPTION =
  "The all-in-one bidding, estimating, and CRM platform for construction companies, general contractors, and trade professionals.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Pro Spec IQ",
  },
  description: DESCRIPTION,
  applicationName: "Pro Spec IQ",
  manifest: "/manifest.json",
  keywords: [
    "construction bidding software",
    "contractor estimating software",
    "general contractor software",
    "construction CRM",
    "bid management",
    "trade contractor software",
    "construction estimating",
    "subcontractor bid tracking",
  ],
  authors: [{ name: "Pro Spec IQ" }],
  creator: "Pro Spec IQ",
  alternates: { canonical: "/" },
  // Google Search Console ownership. This is a public token by design —
  // it appears in page source. Leave it in place; removing it un-verifies
  // the property.
  verification: {
    google: "i8BI2A_Yziu0yj1WiOULs8K2YcPqhG2DJIBwd-54LBU",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Pro Spec IQ",
    url: SITE_URL,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Structured data. Centralised here so every page inherits it without
// per-page schema work.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Pro Spec IQ",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: DESCRIPTION,
      url: SITE_URL,
      offers: [
        {
          "@type": "Offer",
          name: "Pro",
          price: "49",
          priceCurrency: "USD",
          description: "For individual trade contractors",
        },
        {
          "@type": "Offer",
          name: "GC Pro",
          price: "99",
          priceCurrency: "USD",
          description: "For general contractors managing multiple trades",
        },
        {
          "@type": "Offer",
          name: "GC Elite",
          price: "249",
          priceCurrency: "USD",
          description: "For GCs who need advanced plan reading and automation",
        },
      ],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Pro Spec IQ",
      url: SITE_URL,
      description: DESCRIPTION,
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Pro Spec IQ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pro Spec IQ is bidding, estimating, and CRM software for construction companies. It helps general contractors and trade professionals build accurate bids, track jobs, and manage clients in one place.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a free trial?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Every plan includes a 7-day free trial, and no charge is made until the trial ends.",
          },
        },
        {
          "@type": "Question",
          name: "Does it work for both general contractors and single trades?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Trade contractors get a streamlined single-trade estimator, while general contractors can select multiple trades and build a combined bid with per-trade line items.",
          },
        },
        {
          "@type": "Question",
          name: "What trades does Pro Spec IQ support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pro Spec IQ supports electrical, plumbing, HVAC, roofing, concrete, framing, drywall, painting, flooring, and other common construction trades, each with trade-specific cost inputs.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {/* Rendered in the tree rather than a hand-written <head>, which is
            the documented Next.js pattern for JSON-LD and avoids conflicting
            with the Metadata API. Static object — no user input reaches it. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
