import createMDX from "@next/mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeAddMeta from "./rehype-add-meta.mjs";

const nextConfig = {
  output: "export",
  cleanDistDir: true,
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ["md", "mdx", "tsx", "ts", "jsx", "js"],
  experimental: {
    typedRoutes: true,
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkParse, remarkRehype],
    rehypePlugins: [rehypeAddMeta, rehypeStringify],
  },
});

export default withMDX(nextConfig);
