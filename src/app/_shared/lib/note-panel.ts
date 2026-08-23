import type { ComponentType } from 'react';

import { type Backlink, getBacklinks } from '@/shared/lib/backlinks';
import { getPosts, getSlug, type PostFrontmatter } from '@/shared/lib/get-posts';
import { isNoteSlug, normalizeNoteSlugs } from '@/shared/lib/note-slugs';

export type LoadedNotePanel = {
  backlinks: Backlink[];
  slug: string;
  frontmatter: PostFrontmatter | undefined;
  Post: ComponentType;
};

const noteSlugs = getPosts('note').map(getSlug);

export const getNoteSlugs = (): string[] => [...noteSlugs];

export const loadNotePanel = async (slug: string): Promise<LoadedNotePanel | null> => {
  if (!isNoteSlug(slug)) return null;

  const mod = await import(`../content/note/${slug}.mdx`);

  return {
    backlinks: getBacklinks({ type: 'note', slug }),
    slug,
    frontmatter: mod.frontmatter as PostFrontmatter | undefined,
    Post: mod.default as ComponentType,
  };
};

export const loadNotePanels = async (slugs: string[]): Promise<LoadedNotePanel[]> => {
  const unique = normalizeNoteSlugs(slugs);
  const panels = await Promise.all(unique.map(loadNotePanel));

  return panels.filter((panel): panel is LoadedNotePanel => panel !== null);
};
