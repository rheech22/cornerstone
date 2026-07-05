import type { DocType } from '@/shared/lib/explorer-types';

import { getPostData } from './get-posts';

const TYPES: DocType[] = ['blog', 'note'];
const WIKI_LINK_RE = /\[\[(.*?)\]\]/g;
const EXCERPT_LIMIT = 180;
let backlinkIndex: Map<string, Backlink[]> | null = null;

export type Backlink = {
  sourceType: DocType;
  sourceSlug: string;
  sourceTitle: string;
  excerpt: string;
};

type BacklinkTarget = {
  type: DocType;
  slug: string;
};

const parseWikiTarget = (value: string): BacklinkTarget => {
  const trimmed = value.trim();
  const typed = /^(blog|note):(.*)$/.exec(trimmed);

  if (typed) return { type: typed[1] as DocType, slug: typed[2].trim() };

  const normalized = trimmed.replace(/^\.\//, '');
  const routed = /^(?:\.\.\/)?(blog|note)\/(.*)$/.exec(normalized);

  if (routed) return { type: routed[1] as DocType, slug: routed[2].trim() };

  return { type: 'note', slug: normalized };
};

const parseWikiInner = (inner: string) => parseWikiTarget(inner.split('|')[0]);

const backlinkKey = (target: BacklinkTarget): string => `${target.type}/${target.slug}`;

const toExcerpt = (line: string): string => {
  const plain = line
    .replace(WIKI_LINK_RE, (_, inner: string) => {
      const [target, label] = inner.split('|');

      return (label ?? target).replace(/^(blog|note):/, '').replace(/^(?:\.\.\/)?(?:blog|note)\//, '').replace(/^\.\//, '').trim();
    })
    .replace(/[`*_>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= EXCERPT_LIMIT) return plain;

  return `${plain.slice(0, EXCERPT_LIMIT).trimEnd()}...`;
};

const getSourceBacklinks = (sourceType: DocType): Map<string, Backlink[]> => {
  const index = new Map<string, Backlink[]>();

  getPostData(sourceType).forEach(({ slug: sourceSlug, metadata, content }) => {
    const sourceTitle = metadata.title || sourceSlug;

    content.split('\n').forEach((line) => {
      const matches = Array.from(line.matchAll(WIKI_LINK_RE));

      if (matches.length === 0) return;

      const excerpt = toExcerpt(line);

      matches.forEach((match) => {
        const target = parseWikiInner(match[1]);
        const key = backlinkKey(target);
        const backlinks = index.get(key) ?? [];
        const exists = backlinks.some((backlink) => backlink.sourceType === sourceType && backlink.sourceSlug === sourceSlug);

        if (exists) return;

        backlinks.push({ sourceType, sourceSlug, sourceTitle, excerpt });
        index.set(key, backlinks);
      });
    });
  });

  return index;
};

const buildBacklinkIndex = (): Map<string, Backlink[]> => {
  const index = new Map<string, Backlink[]>();

  TYPES.forEach((sourceType) => {
    getSourceBacklinks(sourceType).forEach((backlinks, key) => {
      index.set(key, [...(index.get(key) ?? []), ...backlinks]);
    });
  });

  return index;
};

export const getBacklinks = (target: BacklinkTarget): Backlink[] => {
  backlinkIndex ??= buildBacklinkIndex();

  return (backlinkIndex.get(backlinkKey(target)) ?? [])
    .filter((backlink) => backlink.sourceType !== target.type || backlink.sourceSlug !== target.slug)
    .sort((a, b) => a.sourceTitle.localeCompare(b.sourceTitle));
};
