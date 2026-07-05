'use client';

import { useEffect, useRef, useState } from 'react';

import type { DocType } from '@/shared/lib/explorer-types';

const DEBOUNCE_MS = 120;
const previewCache = new Map<string, string>();

export type PreviewTarget = {
  type: DocType;
  slug: string;
};

export const usePreview = (open: boolean, selected: PreviewTarget | null) => {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedType = selected?.type;
  const selectedSlug = selected?.slug;
  const requestRef = useRef(0);

  useEffect(() => {
    if (!open || !selectedType || !selectedSlug) {
      setHtml(null);
      setLoading(false);

      return;
    }

    const cacheKey = `${selectedType}/${selectedSlug}`;
    const cached = previewCache.get(cacheKey);

    if (cached !== undefined) {
      setHtml(cached);
      setLoading(false);

      return;
    }

    let cancelled = false;
    const requestId = requestRef.current + 1;

    requestRef.current = requestId;

    setLoading(true);
    setHtml(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/preview/${selectedType}/${encodeURIComponent(selectedSlug)}`);
        const data = (await res.json()) as { html?: string };
        const value = data.html ?? '';

        previewCache.set(cacheKey, value);
        if (!cancelled && requestRef.current === requestId) setHtml(value);
      } catch {
        if (!cancelled && requestRef.current === requestId) setHtml('');
      } finally {
        if (!cancelled && requestRef.current === requestId) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, selectedSlug, selectedType]);

  return { html, loading };
};
