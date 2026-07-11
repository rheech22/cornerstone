import type { DocEntry, DocType } from '@/shared/lib/explorer-types';

import { getPostContent, getPostData } from './get-posts';

const INDEX_TEXT_LIMIT = 8000;
const PREVIEW_CHAR_LIMIT = 4000;

const TYPES: DocType[] = ['blog', 'note'];

const stripWikiLinks = (value: string): string =>
  value.replace(/\[\[(.*?)\]\]/g, (_, inner: string) =>
    inner.includes('|') ? inner.split('|')[1] : inner,
  );

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
      updated: metadata.updated,
      text: toSearchText(metadata.title || slug, metadata.tags ?? [], content),
    })),
  ).sort((a, b) => b.updated.localeCompare(a.updated));

export const getDocContent = (type: DocType, slug: string): string | null => getPostContent(type, slug);

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
