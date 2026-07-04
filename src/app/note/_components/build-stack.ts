import type { ComponentType } from "react";

import { getPosts, getSlug } from "@/shared/lib/get-posts";

type Frontmatter = {
  created: string;
  updated: string;
  title: string;
  tags: string[];
};

export type StackPanel = {
  slug: string;
  frontmatter: Frontmatter | undefined;
  Post: ComponentType;
};

export const buildStack = async (slugs: string[]): Promise<StackPanel[]> => {
  const validSlugs = new Set(getPosts("note").map(getSlug));
  const seen = new Set<string>();

  const unique = slugs.filter((slug) => {
    if (seen.has(slug)) return false;
    if (!validSlugs.has(slug)) return false;
    seen.add(slug);

    return true;
  });

  const panels = await Promise.all(
    unique.map(async (slug) => {
      const mod = await import(`../../_shared/content/note/${slug}.mdx`);

      return {
        slug,
        frontmatter: mod.frontmatter as Frontmatter | undefined,
        Post: mod.default as ComponentType,
      };
    }),
  );

  return panels;
};
