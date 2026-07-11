'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Children, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useAppChrome } from '@/shared/components/chrome/app-chrome';
import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { NotePanelSkeleton } from './note-panel';
import {
  buildNoteStackUrl,
  getMobileStackSlugs,
  getStackAction,
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

type PendingAppend = {
  href: string;
  sourceHref: string;
  slugs: string[];
  targetSlug: string;
};

export const NoteStack = ({ slugs, children, spineWidth = NOTE_SPINE_WIDTH }: NoteStackProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { modalOpen } = useAppChrome();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const containerRef = useRef<HTMLDivElement>(null);
  const prefetchTimers = useRef<number[]>([]);
  const prefetchedUrls = useRef(new Set<string>());
  const [manualFoldedSlugs, setManualFoldedSlugs] = useState<string[]>([]);
  const [optimisticallyClosedSlugs, setOptimisticallyClosedSlugs] = useState<string[]>([]);
  const [pendingAppend, setPendingAppend] = useState<PendingAppend | null>(null);
  const [isPending, startTransition] = useTransition();

  const childArray = Children.toArray(children);
  const sourceSlugsKey = slugs.join('\0');
  const visibleSlugs = slugs.filter((slug) => !optimisticallyClosedSlugs.includes(slug));
  const visibleChildren = childArray.filter((_, index) => !optimisticallyClosedSlugs.includes(slugs[index] ?? ''));
  const visiblePanels = visibleSlugs.map((slug, index) => ({ child: visibleChildren[index], slug }));
  const renderedSlugs = pendingAppend?.slugs ?? visibleSlugs;
  const renderedPanels = renderedSlugs.map((slug) => {
    const panel = visiblePanels.find((candidate) => candidate.slug === slug);

    if (panel) return panel;

    if (pendingAppend?.targetSlug === slug) {
      return { child: <NotePanelSkeleton key={slug} slug={slug} />, slug };
    }

    return null;
  }).filter((panel): panel is NonNullable<typeof panel> => panel !== null);
  const activeMobileChild = renderedPanels[renderedPanels.length - 1]?.child;
  const currentHref = `${pathname}${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`;
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
  const focusActivePanel = (slug: string) => {
    if (pendingAppend?.targetSlug === slug) return;

    focusPanel(slug);
  };
  const { activeSlug, activeSlugRef, activatePanel, setPendingActiveSlug, slugsKey } = useActiveNotePanel({
    focusPanel: focusActivePanel,
    isMobile,
    slugs: renderedSlugs,
  });
  const navigateToStack = (nextSlugs: string[], targetSlug: string) => {
    if (pendingAppend) return;

    const href = buildNoteStackUrl(nextSlugs);

    if (!visibleSlugs.includes(targetSlug)) {
      setPendingAppend({ href, sourceHref: currentHref, slugs: nextSlugs, targetSlug });
    }

    setPendingActiveSlug(targetSlug);
    startTransition(() => router.push(href));
  };
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
    onCloseStart: (slug) => {
      setOptimisticallyClosedSlugs((current) => (current.includes(slug) ? current : [...current, slug]));
    },
    onNavigate: navigateToStack,
    scrollPanel,
    setManualFoldedSlugs,
    setPendingActiveSlug,
    slugs: renderedSlugs,
  });

  const prefetchWikiLink = (target: HTMLElement) => {
    const link = target.closest<HTMLAnchorElement>('a.wiki-link');

    if (!link) return;

    const targetSlug = slugFromNoteHref(link.getAttribute('href') ?? '');

    if (!targetSlug) return;

    const href = isMobile
      ? buildNoteStackUrl(getMobileStackSlugs({ slugs: visibleSlugs, targetSlug }))
      : (() => {
        const panelSlug = link.closest('[data-panel-slug]')?.getAttribute('data-panel-slug') ?? '';
        const action = getStackAction({ fromIndex: visibleSlugs.indexOf(panelSlug), slugs: visibleSlugs, targetSlug });

        return action.type === 'navigate' ? buildNoteStackUrl(action.slugs) : null;
      })();

    if (!href || prefetchedUrls.current.has(href)) return;

    prefetchedUrls.current.add(href);
    prefetchTimers.current.push(window.setTimeout(() => router.prefetch(href), 120));
  };

  const handlePointerOver = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>('a.wiki-link');

    if (!link) return;

    const relatedLink = e.relatedTarget instanceof Element ? e.relatedTarget.closest('a.wiki-link') : null;

    if (link === relatedLink) return;

    prefetchWikiLink(target);
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => prefetchWikiLink(e.target as HTMLElement);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (pendingAppend) {
      const pendingAction = target.closest('a.wiki-link, [data-fold-slug], [data-unfold-slug], [data-close-slug]');

      if (pendingAction) e.preventDefault();

      return;
    }

    const panel = target.closest('[data-panel-slug]') as HTMLElement | null;
    const panelSlug = panel?.getAttribute('data-panel-slug') ?? '';

    if (panelSlug) activatePanel(panelSlug);

    const link = target.closest<HTMLAnchorElement>('a.wiki-link');

    if (link) {
      const href = link.getAttribute('href') ?? '';
      const targetSlug = slugFromNoteHref(href);

      if (!targetSlug) return;

      e.preventDefault();

      const fromIndex = visibleSlugs.indexOf(panelSlug);

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
    const link = target.closest<HTMLAnchorElement>('a.wiki-link');

    if (!link) return;

    const href = link.getAttribute('href') ?? '';
    const targetSlug = slugFromNoteHref(href);

    if (!targetSlug) return;

    e.preventDefault();
    navigateToStack(getMobileStackSlugs({ slugs: visibleSlugs, targetSlug }), targetSlug);
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
          if (visibleSlugs.length > 1) {
            closePanel(visibleSlugs[visibleSlugs.length - 1]);
          }
        },
      },
    ],
    { enabled: !modalOpen && !isMobile && !pendingAppend },
  );

  useEffect(() => {
    const stackSlugs = slugsKey ? slugsKey.split('\0') : [];

    setManualFoldedSlugs((current) => pruneFoldedSlugs(current, stackSlugs));
  }, [slugsKey]);

  useEffect(() => {
    const sourceSlugs = new Set(sourceSlugsKey ? sourceSlugsKey.split('\0') : []);

    setOptimisticallyClosedSlugs((current) => {
      const next = current.filter((slug) => sourceSlugs.has(slug));

      return next.length === current.length ? current : next;
    });
  }, [sourceSlugsKey]);

  useEffect(() => {
    if (!pendingAppend) return;

    if (slugs.includes(pendingAppend.targetSlug)) {
      setPendingAppend(null);

      window.requestAnimationFrame(() => focusPanel(pendingAppend.targetSlug));

      return;
    }

    if ((!isPending && currentHref === pendingAppend.href) || currentHref !== pendingAppend.sourceHref) {
      setPendingAppend(null);
    }
  }, [currentHref, focusPanel, isPending, pendingAppend, sourceSlugsKey, slugs]);

  useEffect(
    () => () => {
      prefetchTimers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  if (isMobile) {
    return (
      <div
        data-note-mobile-stack="true"
        aria-busy={Boolean(pendingAppend)}
        onClick={handleMobileClick}
        onFocusCapture={handleFocus}
        onPointerOver={handlePointerOver}
        className={cn('h-full overflow-y-auto tui-scroll')}
      >
        {activeMobileChild}
      </div>
    );
  }

  return (
    <div
      className={cn('h-full border-t-1 border-vague-line overflow-hidden')}
      aria-busy={Boolean(pendingAppend)}
      onClick={handleClick}
      onFocusCapture={handleFocus}
      onPointerOver={handlePointerOver}
      style={noteStackStyle}
    >
      <div ref={containerRef} className={cn('flex h-full overflow-x-auto tui-scroll')}>
        {renderedPanels.map(({ child, slug }, index) => {

          return (
            <div
              key={slug ?? index}
              data-stack-panel
              data-stack-slug={slug}
              data-folded={manualFoldedSlugs.includes(slug)}
              data-auto-spine={autoSpineSlugs.includes(slug)}
              data-active={slug === activeSlug}
              data-single-panel={renderedSlugs.length === 1}
              data-active-visible={renderedSlugs.length > 1 && slug === activeSlug}
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
