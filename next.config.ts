import type { NextConfig } from "next";
import path from "path";

const pages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["three"],
  outputFileTracingRoot: path.join(process.cwd()),
  env: { NEXT_PUBLIC_BASE_PATH: pages ? "/liniya" : "" },
  ...(pages ? { output: "export" as const, basePath: "/liniya", trailingSlash: true } : {}),
};

export default nextConfig;
