import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./src/generated/prisma/**/*",
      "./node_modules/@prisma/client/**/*",
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "stimg.cardekho.com",
      },
    ],
  },
};

export default nextConfig;
