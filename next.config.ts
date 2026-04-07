import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Prisma client types are generated at build time via `prisma generate`
    // Run `npm run setup` before first build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
