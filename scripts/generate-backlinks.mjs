import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src/app/_shared/content');
const OUTPUT_PATH = join(CONTENT_DIR, 'backlinks.json');
const NOTE_SLUGS_PATH = join(CONTENT_DIR, 'note-slugs.json');
const TYPES = ['blog', 'note'];
const WIKI_LINK_RE = /\[\[(.*?)\]\]/g;
const EXCERPT_LIMIT = 180;

const parseWikiTarget = (value) => {
  const trimmed = value.trim().replace(/\.(?:mdx?|html?)$/, '');
  const typed = /^(blog|note):(.*)$/.exec(trimmed);

  if (typed) return { type: typed[1], slug: typed[2].trim() };

  const normalized = trimmed
    .replace(/^\/+/, '')
    .replace(/^(?:\.\.\/)+/, '')
    .replace(/^\.\//, '');
  const literature = /^zt\/literature\/(.*)$/.exec(normalized);

  if (literature) return { type: 'note', slug: literature[1].trim() };

  const routed = /^(?:\.\.\/)?(blog|note)\/(.*)$/.exec(normalized);

  if (routed) return { type: routed[1], slug: routed[2].trim() };

  return { type: 'note', slug: normalized };
};

const getTitleAndContent = (fileContent, fallbackTitle) => {
  const frontmatter = /---\s*([\s\S]*?)\s*---/.exec(fileContent);
  const titleLine = frontmatter?.[1].split('\n').find((line) => line.startsWith('title:'));
  const title = titleLine?.slice('title:'.length).trim().replace(/^['"](.*)['"]$/, '$1') || fallbackTitle;

  return { content: fileContent.replace(/---\s*[\s\S]*?\s*---/, '').trim(), title };
};

const toExcerpt = (line) => {
  const plain = line
    .replace(WIKI_LINK_RE, (_, inner) => {
      const [target, label] = inner.split('|');

      return (label ?? target).replace(/^(blog|note):/, '').replace(/^(?:\.\.\/)?(?:blog|note)\//, '').replace(/^\.\//, '').trim();
    })
    .replace(/[`*_>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return plain.length <= EXCERPT_LIMIT ? plain : `${plain.slice(0, EXCERPT_LIMIT).trimEnd()}...`;
};

const index = {};

for (const sourceType of TYPES) {
  const directory = join(CONTENT_DIR, sourceType);
  const files = readdirSync(directory).filter((fileName) => fileName.endsWith('.mdx') && fileName !== 'index.mdx').sort();

  for (const fileName of files) {
    const sourceSlug = fileName.replace(/\.mdx$/, '');
    const { content, title: sourceTitle } = getTitleAndContent(readFileSync(join(directory, fileName), 'utf8'), sourceSlug);
    const targets = new Set();

    for (const line of content.split('\n')) {
      const excerpt = toExcerpt(line);

      for (const match of line.matchAll(WIKI_LINK_RE)) {
        const target = parseWikiTarget(match[1].split('|')[0]);
        const key = `${target.type}/${target.slug}`;
        const sourceKey = `${sourceType}/${sourceSlug}`;

        if (targets.has(`${key}\0${sourceKey}`)) continue;

        targets.add(`${key}\0${sourceKey}`);
        (index[key] ??= []).push({ sourceType, sourceSlug, sourceTitle, excerpt });
      }
    }
  }
}

for (const backlinks of Object.values(index)) {
  backlinks.sort((a, b) => a.sourceTitle.localeCompare(b.sourceTitle));
}

writeFileSync(OUTPUT_PATH, `${JSON.stringify(index, null, 2)}\n`);

const noteSlugs = readdirSync(join(CONTENT_DIR, 'note'))
  .filter((fileName) => fileName.endsWith('.mdx'))
  .map((fileName) => fileName.replace(/\.mdx$/, ''))
  .sort();

writeFileSync(NOTE_SLUGS_PATH, `${JSON.stringify(noteSlugs, null, 2)}\n`);
