'use client';

import { useEffect, useRef, useState } from 'react';

import { sameSlugs } from './note-stack-model';

type UseActiveNotePanelArgs = {
  slugs: string[];
};

export const useActiveNotePanel = ({ slugs }: UseActiveNotePanelArgs) => {
  const activeSlugRef = useRef(slugs[slugs.length - 1] ?? '');
  const pendingActiveSlugRef = useRef('');
  const [activeSlug, setActiveSlug] = useState(slugs[slugs.length - 1] ?? '');
  const slugsKey = slugs.join('\0');

  const activatePanel = (slug: string) => {
    activeSlugRef.current = slug;
    setActiveSlug((current) => (current === slug ? current : slug));
  };

  const setPendingActiveSlug = (slug: string) => {
    pendingActiveSlugRef.current = slug;
  };
  const clearPendingActiveSlug = () => {
    pendingActiveSlugRef.current = '';
  };

  useEffect(() => {
    const stackSlugs = slugsKey ? slugsKey.split('\0') : [];
    const pendingActiveSlug = pendingActiveSlugRef.current;
    const pendingArrived = stackSlugs.includes(pendingActiveSlug);
    const nextSlug = pendingArrived
      ? pendingActiveSlug
      : stackSlugs.includes(activeSlugRef.current)
        ? activeSlugRef.current
        : stackSlugs[stackSlugs.length - 1] ?? '';

    // A pending target may still be loading; keep it until its panel joins the stack.
    if (pendingArrived) pendingActiveSlugRef.current = '';
    activeSlugRef.current = nextSlug;
    setActiveSlug((current) => (current === nextSlug ? current : nextSlug));

  }, [slugsKey]);

  return { activeSlug, activatePanel, clearPendingActiveSlug, setPendingActiveSlug, slugsKey };
};

export const pruneFoldedSlugs = (current: string[], slugs: string[]) => {
  const next = current.filter((slug) => slugs.includes(slug));

  return sameSlugs(current, next) ? current : next;
};
