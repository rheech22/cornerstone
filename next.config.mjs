import createMDX from "@next/mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeAddMeta from "./rehype-add-meta.mjs";
import rehypeMDXImportMedia from "rehype-mdx-import-media";
import rehypeVimwikiLinks from "./rehype-vimwiki-links.mjs";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const nextConfig = {
  cleanDistDir: true,
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ["md", "mdx", "tsx", "ts", "jsx", "js"],
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      remarkParse,
      remarkMath,
      remarkFrontmatter,
      remarkMdxFrontmatter,
      remarkRehype,
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeAddMeta,
      rehypeVimwikiLinks,
      rehypeMDXImportMedia,
      rehypeStringify,
    ],
  },
});

export default withMDX(nextConfig);
