import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    mdxRs: true,
    turbo: {},
  },
};

// Add markdown plugins here, as desired
// const withMDX = createMDX({
// });

export default nextConfig;
