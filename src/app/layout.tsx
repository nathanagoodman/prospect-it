import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pro Spec IQ — Bid Smarter. Build Bigger.",
  description:
    "The all-in-one bidding, estimating, and CRM platform for construction companies, general contractors, and trade professionals.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Pro Spec IQ — Bid Smarter. Build Bigger.",
    description:
      "The all-in-one bidding, estimating, and CRM platform for construction companies, general contractors, and trade professionals.",
    siteName: "Pro Spec IQ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
