import type { Metadata } from "next";

import { cn } from "@/shared/lib/cn";
import { getPostData } from "@/shared/lib/get-posts";

import { Archive, type ArchiveYear } from "./_components/archive";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type Post = ReturnType<typeof getPostData>[number];

const buildArchive = (posts: Post[]): ArchiveYear[] => {
  const tree = new Map<number, Map<number, Map<number, Post[]>>>();

  for (const post of posts) {
    const d = new Date(post.metadata.created);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();

    if (!tree.has(y)) tree.set(y, new Map());

    const months = tree.get(y)!;

    if (!months.has(m)) months.set(m, new Map());

    const days = months.get(m)!;

    if (!days.has(day)) days.set(day, []);

    days.get(day)!.push(post);
  }

  return [...tree.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, days]) => ({
          month,
          days: [...days.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([day, dayPosts]) => ({
              day,
              posts: [...dayPosts]
                .sort(
                  (a, b) =>
                    new Date(b.metadata.created).getTime() -
                    new Date(a.metadata.created).getTime(),
                )
                .map((post) => ({
                  slug: post.slug,
                  metadata: { title: post.metadata.title },
                })),
            })),
        })),
    }));
};

const BlogPage = async () => {
  const data = getPostData("blog");
  const archive = buildArchive(data);

  return (
    <div className={cn("vague-select flex-1 bg-vague-bg font-mono text-vague-fg")}>
      <div className={cn("mx-auto w-full max-w-2xl px-6 py-16")}>
        <Archive archive={archive} />
      </div>
    </div>
  );
};

export default BlogPage;
