import type { Metadata } from "next";

/**
 * Shared proposals are private links. Even though robots.txt disallows
 * /bid/, a meta robots tag is the belt-and-braces version — a link
 * forwarded into an indexed context still shouldn't end up in search
 * results with a customer's name and price on it.
 */
export const metadata: Metadata = {
  title: "Proposal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function PublicBidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
