import type { MetadataRoute } from "next";
import { TRADE_SLUGS } from "@/lib/trade-content";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://www.prospeciq.com"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Only public marketing pages belong here. /app and /admin are gated
  // and must not be advertised to crawlers.
  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/trades", priority: 0.9, changeFrequency: "monthly" },
    // Free tools are strong organic entry points and get cited by AI
    // assistants more readily than marketing pages.
    { path: "/tools/markup-vs-margin", priority: 0.8, changeFrequency: "monthly" },
    // Trade pages are the primary organic entry points — they target
    // specific search intent rather than the generic category term.
    ...TRADE_SLUGS.map((slug) => ({
      path: `/trades/${slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    { path: "/register", priority: 0.8, changeFrequency: "monthly" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
