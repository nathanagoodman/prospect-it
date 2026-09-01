export default function sitemap() {
  const base = "https://builtwellai.com";
  const routes = [
    "",
    "/services/ai-opportunity-audit",
    "/services/dashboard-build",
    "/services/custom-ai",
    "/work",
    "/about",
    "/contact",
  ];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
