'use client';

import { useEffect, useRef, useState } from 'react';

import type { DocEntry } from '@/shared/lib/explorer-types';

const DEBOUNCE_MS = 120;

export const usePreview = (open: boolean, selected: DocEntry | null) => {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(new Map<string, string>());

  useEffect(() => {
    if (!open || !selected) {
      setHtml(null);

      return;
    }

    const cacheKey = `${selected.type}/${selected.slug}`;
    const cached = cacheRef.current.get(cacheKey);

    if (cached !== undefined) {
      setHtml(cached);
      setLoading(false);

      return;
    }

    let cancelled = false;

    setLoading(true);
    setHtml(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/preview/${selected.type}/${selected.slug}`);
        const data = (await res.json()) as { html?: string };
        const value = data.html ?? '';

        cacheRef.current.set(cacheKey, value);
        if (!cancelled) setHtml(value);
      } catch {
        if (!cancelled) setHtml('');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, selected]);

  return { html, loading };
};
