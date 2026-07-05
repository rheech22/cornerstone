import type { DocEntry, Scope } from '@/shared/lib/explorer-types';

import { fuzzyMatch } from './fuzzy';

const SCOPE_TOKENS = ['blog', 'note'] as const;

export type Query = { scopes: Scope[]; tags: string[]; terms: string[] };

export const parseQuery = (raw: string): Query => {
  const tokens = raw.toLowerCase().split(/\s+/).filter(Boolean);
  const scopes: Scope[] = [];
  const tags: string[] = [];
  const terms: string[] = [];

  for (const token of tokens) {
    if (token.startsWith('@') && token.length > 1) {
      const scope = token.slice(1);

      if ((SCOPE_TOKENS as readonly string[]).includes(scope)) scopes.push(scope as Scope);
    } else if (token.startsWith('#') && token.length > 1) {
      tags.push(token.slice(1));
    } else {
      terms.push(token);
    }
  }

  return { scopes, tags, terms };
};

const matchesScopes = (entry: DocEntry, scopes: Scope[]): boolean =>
  scopes.length === 0 || scopes.includes(entry.type);

const hasTags = (entry: DocEntry, tags: string[]): boolean =>
  tags.every((tag) => entry.tags.some((t) => t.toLowerCase().includes(tag)));

const fieldScore = (term: string, target: string, weight: number, threshold = 0.4): number => {
  const match = fuzzyMatch(term, target);

  if (!match || match.score < threshold) return 0;

  return match.score * weight;
};

const termScore = (entry: DocEntry, term: string): number => {
  const titleScore = fieldScore(term, entry.title, 3);
  const tagScore = Math.max(...entry.tags.map((tag) => fieldScore(term, tag, 2)), 0);
  const textExactScore = entry.text.includes(term) ? 1 : 0;
  const textFuzzyScore = term.length > 1 ? fieldScore(term, entry.text, 0.75, 0.68) : 0;

  return Math.max(titleScore, tagScore, textExactScore, textFuzzyScore);
};

export const countByType = (entries: DocEntry[]) => ({
  blog: entries.filter((e) => e.type === 'blog').length,
  note: entries.filter((e) => e.type === 'note').length,
});

export const tagIndex = (entries: DocEntry[]): Array<{ tag: string; count: number }> => {
  const groups = new Map<string, { count: number; spellings: Map<string, number> }>();

  for (const entry of entries) {
    for (const tag of entry.tags) {
      const key = tag.toLowerCase();
      const group = groups.get(key) ?? { count: 0, spellings: new Map() };

      group.count += 1;
      group.spellings.set(tag, (group.spellings.get(tag) ?? 0) + 1);
      groups.set(key, group);
    }
  }

  const canonical = (spellings: Map<string, number>) =>
    [...spellings.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];

  return [...groups.values()]
    .map((group) => ({ tag: canonical(group.spellings), count: group.count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
};

export const filterDocs = (entries: DocEntry[], query: string): DocEntry[] => {
  const { scopes, tags, terms } = parseQuery(query);
  const scored: Array<{ entry: DocEntry; score: number }> = [];

  for (const entry of entries) {
    if (!matchesScopes(entry, scopes)) continue;
    if (!hasTags(entry, tags)) continue;

    let score = 0;
    let matchedAll = true;

    for (const term of terms) {
      const s = termScore(entry, term);

      if (s === 0) {
        matchedAll = false;
        break;
      }
      score += s;
    }

    if (!matchedAll) continue;

    scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || b.entry.updated.localeCompare(a.entry.updated))
    .map((s) => s.entry);
};
