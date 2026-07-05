'use client';

import { type RefObject, useRef, useState } from 'react';

import { useAppChrome } from '@/shared/components/chrome/app-chrome';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

export const useArchiveNavigation = (listRef: RefObject<HTMLDivElement | null>) => {
  const { modalOpen } = useAppChrome();
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [browsing, setBrowsing] = useState(false);

  const activateRow = (index: number) => {
    if (browsing && activeIndexRef.current === index) return;

    activeIndexRef.current = index;
    setActiveIndex(index);
    setBrowsing(true);
  };

  const focusRow = (index: number) => {
    const links = listRef.current?.querySelectorAll<HTMLAnchorElement>('[data-blog-row]');

    if (!links || links.length === 0) return;

    const nextIndex = Math.min(Math.max(index, 0), links.length - 1);

    activateRow(nextIndex);
    links[nextIndex]?.focus({ preventScroll: true });
    links[nextIndex]?.scrollIntoView({ block: 'nearest' });
  };

  const moveRow = (delta: number) => focusRow(activeIndexRef.current + delta);

  useShortcuts(
    [
      { key: 'j', onTrigger: () => moveRow(1) },
      { key: 'ArrowDown', onTrigger: () => moveRow(1) },
      { key: 'k', onTrigger: () => moveRow(-1) },
      { key: 'ArrowUp', onTrigger: () => moveRow(-1) },
    ],
    { enabled: !modalOpen },
  );

  return { activeIndex, activateRow, browsing };
};
