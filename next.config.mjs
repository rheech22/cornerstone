import createMDX from "@next/mdx";

const nextConfig = {
  output: "export",
  cleanDistDir: true,
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ["md", "mdx", "tsx", "ts", "jsx", "js"],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {},
});

export default withMDX(nextConfig);
