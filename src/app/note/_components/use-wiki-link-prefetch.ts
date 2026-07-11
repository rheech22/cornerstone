'use client';

import type { FocusEvent, PointerEvent } from 'react';
import { useEffect, useRef } from 'react';

import { useNotePanelCache } from './note-panel-cache-provider';

type UseWikiLinkPrefetchArgs = {
  isMobile: boolean;
};

const getNoteSlug = (target: HTMLElement): string => {
  const link = target.closest<HTMLAnchorElement>('a.wiki-link');

  return link?.dataset.wikiType === 'note' ? link.dataset.wikiSlug ?? '' : '';
};

export const useWikiLinkPrefetch = ({ isMobile }: UseWikiLinkPrefetchArgs) => {
  const cache = useNotePanelCache();
  const timers = useRef(new Map<string, number>());

  const prefetch = (target: HTMLElement, delay: number) => {
    const slug = getNoteSlug(target);

    if (!slug || cache.peek(slug)) return;

    if (delay === 0) {
      const scheduled = timers.current.get(slug);

      if (scheduled !== undefined) {
        window.clearTimeout(scheduled);
        timers.current.delete(slug);
      }

      cache.prefetch(slug);

      return;
    }

    if (timers.current.has(slug)) return;

    timers.current.set(slug, window.setTimeout(() => {
      timers.current.delete(slug);
      cache.prefetch(slug);
    }, delay));
  };

  const onPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>('a.wiki-link');

    if (!link) return;

    const relatedLink = event.relatedTarget instanceof Element ? event.relatedTarget.closest('a.wiki-link') : null;

    if (link !== relatedLink) prefetch(target, 60);
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => prefetch(event.target as HTMLElement, 0);

  useEffect(() => {
    const scheduled = timers.current;

    return () => {
      scheduled.forEach((timer) => window.clearTimeout(timer));
      scheduled.clear();
    };
  }, [isMobile]);

  return { onFocus, onPointerOver };
};
