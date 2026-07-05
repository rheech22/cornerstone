'use client';

import { useEffect, useRef, useState } from 'react';

import { sameSlugs } from './note-stack-model';

type UseActiveNotePanelArgs = {
  focusPanel: (slug: string) => void;
  isMobile: boolean;
  slugs: string[];
};

export const useActiveNotePanel = ({ focusPanel, isMobile, slugs }: UseActiveNotePanelArgs) => {
  const activeSlugRef = useRef(slugs[slugs.length - 1] ?? '');
  const pendingActiveSlugRef = useRef('');
  const focusPanelRef = useRef(focusPanel);
  const [activeSlug, setActiveSlug] = useState(slugs[slugs.length - 1] ?? '');
  const slugsKey = slugs.join('\0');

  useEffect(() => {
    focusPanelRef.current = focusPanel;
  }, [focusPanel]);

  const activatePanel = (slug: string) => {
    activeSlugRef.current = slug;
    setActiveSlug((current) => (current === slug ? current : slug));
  };

  const setPendingActiveSlug = (slug: string) => {
    pendingActiveSlugRef.current = slug;
  };

  useEffect(() => {
    const stackSlugs = slugsKey ? slugsKey.split('\0') : [];
    const pendingActiveSlug = pendingActiveSlugRef.current;
    const nextSlug = stackSlugs.includes(pendingActiveSlug)
      ? pendingActiveSlug
      : stackSlugs.includes(activeSlugRef.current)
        ? activeSlugRef.current
        : stackSlugs[stackSlugs.length - 1] ?? '';

    pendingActiveSlugRef.current = '';
    activeSlugRef.current = nextSlug;
    setActiveSlug((current) => (current === nextSlug ? current : nextSlug));

    if (!isMobile && nextSlug) {
      window.requestAnimationFrame(() => focusPanelRef.current(nextSlug));
    }
  }, [isMobile, slugsKey]);

  return { activeSlug, activeSlugRef, activatePanel, setPendingActiveSlug, slugsKey };
};

export const pruneFoldedSlugs = (current: string[], slugs: string[]) => {
  const next = current.filter((slug) => slugs.includes(slug));

  return sameSlugs(current, next) ? current : next;
};
