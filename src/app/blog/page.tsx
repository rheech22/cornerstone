import type { Metadata } from "next";
import Link from "next/link";

import { cn } from "../lib/cn";
import { getPostData } from "../lib/get-posts";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const BlogPage = async () => {
  const data = getPostData("blog");

  return (
    <ul className={cn("mt-12 flex flex-col items-center gap-2")}>
      {data.map(({ slug, metadata: { title } }) => {
        return (
          <li key={slug}>
            <Link
              href={`/blog/${slug}`}
              className={cn("w-full text-start underline underline-offset-8 hover:text-[var(--color-accent)] hover:no-underline hover:font-semibold")}
            >
              {title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default BlogPage;
