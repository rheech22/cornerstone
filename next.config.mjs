import createMDX from "@next/mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeAddMeta from "./rehype-add-meta.mjs";
import rehypeMDXImportMedia from "rehype-mdx-import-media";

const nextConfig = {
  cleanDistDir: true,
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ["md", "mdx", "tsx", "ts", "jsx", "js"],
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ["images.unsplash.com"],
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkParse, remarkRehype],
    rehypePlugins: [rehypeAddMeta, rehypeMDXImportMedia, rehypeStringify],
  },
});

export default withMDX(nextConfig);
