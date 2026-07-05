export type ContentItem = {
  slug: string;
  metadata: {
    created: string;
    updated: string;
    title: string;
    tags: string[];
  };
  content: string;
};

export type TagGroup = {
  tag: string;
  notes: ContentItem[];
};

export type PostGroup = {
  year: string;
  posts: ContentItem[];
};

export type MapEdge = {
  source: string;
  target: string;
  kind: 'wikilink';
};

export type ExternalLink = {
  href: string;
  label: string;
  host: string;
  source: {
    type: 'blog' | 'note';
    slug: string;
    title: string;
  };
};

export const PAGE_LINKS = [
  { href: '/', label: '/', desc: 'home' },
  { href: '/about', label: '/about', desc: 'about this site' },
  { href: '/blog', label: '/blog', desc: 'posts archive' },
  { href: '/note', label: '/note', desc: 'stacked notes' },
  { href: '/sitemap', label: '/sitemap', desc: 'textual atlas' },
] as const;

export const EXTERNAL_LINK_LIMIT = 48;

const WIKI_LINK_REGEX = /\[\[(.*?)\]\]/g;
const MARKDOWN_LINK_REGEX = /(?<!!)\[([^\]]+)]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g;

const yearFromDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'unknown';

  return String(date.getFullYear());
};

const normalizeWikiTarget = (value: string) => {
  const raw = value.split('|')[0].trim().replace(/\.mdx$/, '');
  const normalized = raw.replace(/\\/g, '/');

  if (normalized.startsWith('/note/')) return normalized.slice('/note/'.length);
  if (normalized.includes('/note/')) return normalized.split('/note/').pop() ?? normalized;

  return normalized.split('/').pop() ?? normalized;
};

const extractWikiTargets = (content: string) => {
  const targets: string[] = [];

  for (const match of content.matchAll(WIKI_LINK_REGEX)) {
    const target = normalizeWikiTarget(match[1]);

    if (target.length > 0) targets.push(target);
  }

  return targets;
};

export const buildEdges = (notes: ContentItem[]) => {
  const noteSlugs = new Set(notes.map((note) => note.slug));
  const edgeKeys = new Set<string>();
  const edges: MapEdge[] = [];

  notes.forEach((note) => {
    extractWikiTargets(note.content).forEach((target) => {
      if (!noteSlugs.has(target)) return;

      const key = `${note.slug}->${target}`;

      if (edgeKeys.has(key)) return;

      edgeKeys.add(key);
      edges.push({ source: note.slug, target, kind: 'wikilink' });
    });
  });

  return edges;
};

export const sortByTitle = (items: ContentItem[]) =>
  [...items].sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));

export const buildTagGroups = (notes: ContentItem[]) => {
  const groups = new Map<string, ContentItem[]>();

  notes.forEach((note) => {
    const tags = note.metadata.tags.length > 0 ? note.metadata.tags : ['untagged'];

    tags.forEach((tag) => {
      groups.set(tag, [...(groups.get(tag) ?? []), note]);
    });
  });

  return Array.from(groups.entries())
    .map(([tag, groupNotes]) => ({ tag, notes: sortByTitle(groupNotes) }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
};

export const buildPostGroups = (posts: ContentItem[]) => {
  const groups = new Map<string, ContentItem[]>();

  posts.forEach((post) => {
    const year = yearFromDate(post.metadata.created);

    groups.set(year, [...(groups.get(year) ?? []), post]);
  });

  return Array.from(groups.entries())
    .map(([year, yearPosts]) => ({
      year,
      posts: [...yearPosts].sort((a, b) => new Date(b.metadata.created).getTime() - new Date(a.metadata.created).getTime()),
    }))
    .sort((a, b) => b.year.localeCompare(a.year));
};

const hostnameFromHref = (href: string) => {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
};

export const buildExternalLinks = ({ blogs, notes }: { blogs: ContentItem[]; notes: ContentItem[] }) => {
  const seen = new Set<string>();
  const links: ExternalLink[] = [];

  const collect = (type: 'blog' | 'note', item: ContentItem) => {
    for (const match of item.content.matchAll(MARKDOWN_LINK_REGEX)) {
      const [, label, href] = match;
      const key = `${href}:${item.slug}`;

      if (seen.has(key)) continue;

      seen.add(key);
      links.push({
        href,
        label: label.trim(),
        host: hostnameFromHref(href),
        source: { type, slug: item.slug, title: item.metadata.title },
      });
    }
  };

  notes.forEach((note) => collect('note', note));
  blogs.forEach((blog) => collect('blog', blog));

  return links.sort((a, b) => a.host.localeCompare(b.host) || a.label.localeCompare(b.label));
};

export const getTopConstellations = (tagGroups: TagGroup[]) =>
  [...tagGroups].sort((a, b) => b.notes.length - a.notes.length || a.tag.localeCompare(b.tag)).slice(0, 12);
