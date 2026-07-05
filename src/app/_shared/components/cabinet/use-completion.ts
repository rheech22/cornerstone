'use client';

import { useEffect, useMemo, useState } from 'react';

import type { CompletionItem } from './completion';

const MAX_TAGS = 8;

type ScopeCounts = { blog: number; note: number };
type TagList = Array<{ tag: string; count: number }>;

export const useCompletion = (
  query: string,
  setQuery: (next: string) => void,
  scopeCounts: ScopeCounts,
  tagList: TagList,
) => {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const activeToken = query.split(/\s/).pop() ?? '';

  const items = useMemo<CompletionItem[]>(() => {
    if (dismissed) return [];

    if (activeToken.startsWith('@')) {
      const q = activeToken.slice(1).toLowerCase();

      return [
        { insert: '@blog', label: 'blog', count: scopeCounts.blog },
        { insert: '@note', label: 'note', count: scopeCounts.note },
      ].filter((item) => item.label.includes(q));
    }

    if (activeToken.startsWith('#')) {
      const q = activeToken.slice(1).toLowerCase();

      return tagList
        .filter((t) => t.tag.toLowerCase().includes(q))
        .slice(0, MAX_TAGS)
        .map((t) => ({ insert: `#${t.tag}`, label: `#${t.tag}`, count: t.count }));
    }

    return [];
  }, [activeToken, dismissed, scopeCounts, tagList]);

  const isOpen = items.length > 0;

  useEffect(() => setIndex(0), [activeToken]);
  useEffect(() => setDismissed(false), [query]);

  const move = (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), items.length - 1));

  const activate = (nextIndex: number) => setIndex(Math.min(Math.max(nextIndex, 0), items.length - 1));

  const accept = (item: CompletionItem | undefined = items[index]) => {
    if (!item) return;

    setQuery(`${query.slice(0, query.length - activeToken.length)}${item.insert} `);
    setDismissed(false);
  };

  const dismiss = () => setDismissed(true);

  return { items, index, isOpen, move, activate, accept, dismiss };
};
