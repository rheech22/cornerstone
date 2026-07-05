import type { DocEntry, DocType } from '@/shared/lib/explorer-types';

import { getExcerpt, getPostData, getPosts, getSlug } from './get-posts';

const INDEX_TEXT_LIMIT = 8000;
const EXCERPT_LIMIT = 160;
const PREVIEW_CHAR_LIMIT = 4000;

const TYPES: DocType[] = ['blog', 'note'];

const stripWikiLinks = (value: string): string =>
  value.replace(/\[\[(.*?)\]\]/g, (_, inner: string) =>
    inner.includes('|') ? inner.split('|')[1] : inner,
  );

const toExcerpt = (content: string): string => {
  const line = getExcerpt(content)
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);

  if (!line) return '';

  return line.length > EXCERPT_LIMIT ? `${line.slice(0, EXCERPT_LIMIT).trimEnd()}…` : line;
};

const toSearchText = (title: string, tags: string[], content: string): string =>
  `${title} ${tags.join(' ')} ${stripWikiLinks(content)}`
    .toLowerCase()
    .slice(0, INDEX_TEXT_LIMIT);

export const buildExplorerIndex = (): DocEntry[] =>
  TYPES.flatMap((type) =>
    getPostData(type).map(({ slug, metadata, content }) => ({
      slug,
      type,
      title: metadata.title || slug,
      tags: metadata.tags ?? [],
      created: metadata.created,
      updated: metadata.updated,
      excerpt: toExcerpt(content),
      text: toSearchText(metadata.title || slug, metadata.tags ?? [], content),
    })),
  );

export const getDocContent = (type: DocType, slug: string): string | null => {
  const valid = getPosts(type).some((file) => getSlug(file) === slug);

  if (!valid) return null;

  return getPostData(type).find((doc) => doc.slug === slug)?.content ?? null;
};

export const preparePreviewMarkdown = (content: string): string => {
  const lines = content.split('\n').filter((line) => {
    const trimmed = line.trim();

    if (trimmed.match(/^import\s.+;?$/)) return false;
    if (trimmed.match(/^<\/?[A-Z][^>]*>$/)) return false;
    if (trimmed.match(/^!\[.*\]\(.*\)$/)) return false;

    return true;
  });

  const markdown = stripWikiLinks(lines.join('\n'))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .trim();

  if (markdown.length <= PREVIEW_CHAR_LIMIT) return markdown;

  const clipped = markdown.slice(0, PREVIEW_CHAR_LIMIT);
  const lastBreak = clipped.lastIndexOf('\n');

  return `${(lastBreak > 0 ? clipped.slice(0, lastBreak) : clipped).trimEnd()}\n\n…`;
};
