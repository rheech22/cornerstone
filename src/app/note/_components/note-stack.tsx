'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Children, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAppChrome } from '@/shared/components/chrome/app-chrome';
import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import {
  buildNoteStackUrl,
  getMobileStackSlugs,
  NOTE_SPINE_WIDTH,
  slugFromNoteHref,
} from './note-stack-model';
import { pruneFoldedSlugs, useActiveNotePanel } from './use-active-note-panel';
import { useAutoSpines } from './use-auto-spines';
import { useNoteStackActions } from './use-note-stack-actions';
import { useNoteStackFocus } from './use-note-stack-focus';

type NoteStackProps = {
  slugs: string[];
  children: ReactNode;
  spineWidth?: number;
};

export const NoteStack = ({ slugs, children, spineWidth = NOTE_SPINE_WIDTH }: NoteStackProps) => {
  const router = useRouter();
  const { modalOpen } = useAppChrome();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLength = useRef(0);
  const [manualFoldedSlugs, setManualFoldedSlugs] = useState<string[]>([]);

  const childArray = Children.toArray(children);
  const activeMobileChild = childArray[childArray.length - 1];
  const noteStackStyle = {
    '--note-spine-width': `${spineWidth}px`,
  } as CSSProperties;
  const { autoSpineSlugs, getPanelMetrics, updateAutoSpines } = useAutoSpines({
    containerRef,
    isMobile,
    manualFoldedSlugs,
    spineWidth,
  });
  const { focusPanel, scrollPanel } = useNoteStackFocus({
    containerRef,
    getPanelMetrics,
    spineWidth,
    updateAutoSpines,
  });
  const { activeSlug, activeSlugRef, activatePanel, setPendingActiveSlug, slugsKey } = useActiveNotePanel({
    focusPanel,
    isMobile,
    slugs,
  });
  const {
    closeActivePanel,
    closeAndActivatePanel,
    closePanel,
    focusExistingPanel,
    foldPanel,
    moveActivePanel,
    pushToStack,
    scrollActivePanel,
    toggleActiveFold,
  } = useNoteStackActions({
    activatePanel,
    activeSlugRef,
    autoSpineSlugs,
    focusPanel,
    manualFoldedSlugs,
    scrollPanel,
    setManualFoldedSlugs,
    setPendingActiveSlug,
    slugs,
  });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const panel = target.closest('[data-panel-slug]') as HTMLElement | null;
    const panelSlug = panel?.getAttribute('data-panel-slug') ?? '';

    if (panelSlug) activatePanel(panelSlug);

    const link = target.closest('a.wiki-link');

    if (link) {
      e.preventDefault();

      const href = link.getAttribute('href') ?? '';
      const targetSlug = slugFromNoteHref(href);

      if (!targetSlug) return;

      const fromIndex = slugs.indexOf(panelSlug);

      pushToStack(fromIndex, targetSlug);

      return;
    }

    const foldBtn = target.closest('[data-fold-slug]');

    if (foldBtn) {
      const slug = foldBtn.getAttribute('data-fold-slug');

      if (slug) foldPanel(slug);

      return;
    }

    const unfoldBtn = target.closest('[data-unfold-slug]');

    if (unfoldBtn) {
      const slug = unfoldBtn.getAttribute('data-unfold-slug');

      if (slug) focusExistingPanel(slug);

      return;
    }

    const closeBtn = target.closest('[data-close-slug]');

    if (closeBtn) {
      const slug = closeBtn.getAttribute('data-close-slug');

      if (slug) closeAndActivatePanel(slug);
    }
  };

  const handleMobileClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a.wiki-link');

    if (!link) return;

    e.preventDefault();

    const href = link.getAttribute('href') ?? '';
    const targetSlug = slugFromNoteHref(href);

    if (targetSlug) router.push(buildNoteStackUrl(getMobileStackSlugs({ slugs, targetSlug })));
  };

  useShortcuts(
    [
      { key: 'j', onTrigger: () => scrollActivePanel(1) },
      { key: 'k', onTrigger: () => scrollActivePanel(-1) },
      { key: 'h', onTrigger: () => moveActivePanel(-1) },
      { key: 'ArrowLeft', onTrigger: () => moveActivePanel(-1) },
      { key: 'l', onTrigger: () => moveActivePanel(1) },
      { key: 'ArrowRight', onTrigger: () => moveActivePanel(1) },
      { key: 'f', onTrigger: toggleActiveFold },
      { key: 'x', onTrigger: closeActivePanel },
      {
        key: 'Escape',
        onTrigger: () => {
          if (slugs.length > 1) {
            closePanel(slugs[slugs.length - 1]);
          }
        },
      },
    ],
    { enabled: !modalOpen && !isMobile },
  );

  useEffect(() => {
    const stackSlugs = slugsKey ? slugsKey.split('\0') : [];

    setManualFoldedSlugs((current) => pruneFoldedSlugs(current, stackSlugs));
  }, [slugsKey]);

  useEffect(() => {
    if (isMobile) return;

    if (slugs.length <= prevLength.current) {
      prevLength.current = slugs.length;

      return;
    }

    prevLength.current = slugs.length;
    const container = containerRef.current;

    if (!container) return;

    container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    const timer = window.setTimeout(updateAutoSpines, 450);

    return () => window.clearTimeout(timer);
  }, [isMobile, slugs.length, updateAutoSpines]);

  if (isMobile) {
    return (
      <div data-note-mobile-stack="true" onClick={handleMobileClick} className={cn('h-full overflow-y-auto tui-scroll')}>
        {activeMobileChild}
      </div>
    );
  }

  return (
    <div className={cn('h-full border-t-1 border-vague-line overflow-hidden')} onClick={handleClick} style={noteStackStyle}>
      <div ref={containerRef} className={cn('flex h-full overflow-x-auto tui-scroll')}>
        {childArray.map((child, index) => {
          const slug = slugs[index];

          return (
            <div
              key={slug ?? index}
              data-stack-panel
              data-stack-slug={slug}
              data-folded={slug ? manualFoldedSlugs.includes(slug) : false}
              data-auto-spine={slug ? autoSpineSlugs.includes(slug) : false}
              data-active={slug === activeSlug}
              data-active-visible={slugs.length > 1 && slug === activeSlug}
              className={cn('sticky shrink-0')}
              style={{ left: index * spineWidth, zIndex: index + 1 }}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
};
