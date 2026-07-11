import noteSlugs from '../content/note-slugs.json';

export const MAX_NOTE_STACK_SIZE = 12;

const validNoteSlugs = new Set(noteSlugs as string[]);

export const isNoteSlug = (slug: string): boolean => slug.length <= 128 && validNoteSlugs.has(slug);

export const normalizeNoteSlugs = (slugs: string[]): string[] => {
  const seen = new Set<string>();

  return slugs.filter((slug) => {
    if (!isNoteSlug(slug) || seen.has(slug)) return false;

    seen.add(slug);

    return true;
  }).slice(0, MAX_NOTE_STACK_SIZE);
};
