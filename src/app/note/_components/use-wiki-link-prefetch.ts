'use client';

import type { FocusEvent, PointerEvent } from 'react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { buildNoteStackUrl, getMobileStackSlugs, getStackAction, slugFromNoteHref } from './note-stack-model';

type UseWikiLinkPrefetchArgs = {
  isMobile: boolean;
  slugs: string[];
};

export const useWikiLinkPrefetch = ({ isMobile, slugs }: UseWikiLinkPrefetchArgs) => {
  const router = useRouter();
  const timers = useRef(new Map<string, number>());
  const prefetchedUrls = useRef(new Set<string>());
  const slugsKey = slugs.join('\0');

  const prefetch = (target: HTMLElement) => {
    const link = target.closest<HTMLAnchorElement>('a.wiki-link');

    if (!link) return;

    const targetSlug = slugFromNoteHref(link.getAttribute('href') ?? '');

    if (!targetSlug) return;

    const href = isMobile
      ? buildNoteStackUrl(getMobileStackSlugs({ slugs, targetSlug }))
      : (() => {
        const panelSlug = link.closest('[data-panel-slug]')?.getAttribute('data-panel-slug') ?? '';
        const action = getStackAction({ fromIndex: slugs.indexOf(panelSlug), slugs, targetSlug });

        return action.type === 'navigate' ? buildNoteStackUrl(action.slugs) : null;
      })();

    if (!href || prefetchedUrls.current.has(href)) return;

    prefetchedUrls.current.add(href);
    timers.current.set(href, window.setTimeout(() => {
      timers.current.delete(href);
      router.prefetch(href);
    }, 120));
  };

  const onPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>('a.wiki-link');

    if (!link) return;

    const relatedLink = event.relatedTarget instanceof Element ? event.relatedTarget.closest('a.wiki-link') : null;

    if (link !== relatedLink) prefetch(target);
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => prefetch(event.target as HTMLElement);

  useEffect(() => {
    const scheduled = timers.current;
    const prefetched = prefetchedUrls.current;

    return () => {
      scheduled.forEach((timer, href) => {
        window.clearTimeout(timer);
        prefetched.delete(href);
      });
      scheduled.clear();
      prefetched.clear();
    };
  }, [isMobile, slugsKey]);

  return { onFocus, onPointerOver };
};
