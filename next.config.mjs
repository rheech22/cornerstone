import createMDX from "@next/mdx";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  cleanDistDir: true,
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ["md", "mdx", "tsx", "ts", "jsx", "js"],
  typedRoutes: true,
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
      "remark-parse",
      "remark-math",
      "remark-frontmatter",
      "remark-mdx-frontmatter",
      "remark-rehype",
    ],
    rehypePlugins: [
      join(__dirname, "rehype-add-meta.mjs"),
      join(__dirname, "rehype-vimwiki-links.mjs"),
      "rehype-mdx-import-media",
      "rehype-katex",
      "rehype-stringify",
    ],
  },
});

export default withMDX(nextConfig);
