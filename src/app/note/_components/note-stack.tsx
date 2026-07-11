'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Children, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useAppChrome } from '@/shared/components/chrome/app-chrome';
import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { NotePanelSkeleton } from './note-panel';
import { getNotePanelCommand } from './note-stack-command';
import {
  getMobileStackSlugs,
  NOTE_SPINE_WIDTH,
  type StackNavigation,
} from './note-stack-model';
import { pruneFoldedSlugs, useActiveNotePanel } from './use-active-note-panel';
import { useAutoSpines } from './use-auto-spines';
import { useNoteStackActions } from './use-note-stack-actions';
import { useNoteStackFocus } from './use-note-stack-focus';
import { usePendingNoteNavigation } from './use-pending-note-navigation';
import { useWikiLinkPrefetch } from './use-wiki-link-prefetch';

type NoteStackProps = {
  slugs: string[];
  children: ReactNode;
  spineWidth?: number;
};

type RenderedPanel = {
  content: ReactNode;
  slug: string;
  status: 'pending' | 'resolved';
};

export const NoteStack = ({ slugs, children, spineWidth = NOTE_SPINE_WIDTH }: NoteStackProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { modalOpen } = useAppChrome();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const containerRef = useRef<HTMLDivElement>(null);
  const focusRequestId = useRef(0);
  const handledFocusRequestId = useRef(0);
  const keyboardNavigationTimer = useRef<number | null>(null);
  const [manualFoldedSlugs, setManualFoldedSlugs] = useState<string[]>([]);
  const [focusRequest, setFocusRequest] = useState<{ id: number; slug: string } | null>(null);
  const [keyboardNavigating, setKeyboardNavigating] = useState(false);
  const currentHref = `${pathname}${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`;
  const {
    isNavigating,
    isNavigationActive,
    navigate,
    optimisticallyClosedSlugs,
    pendingAppend,
  } = usePendingNoteNavigation({ currentHref, serverSlugs: slugs });
  const closedSlugs = new Set(optimisticallyClosedSlugs);
  const childArray = Children.toArray(children);
  const resolvedPanels: RenderedPanel[] = slugs
    .map((slug, index) => ({ content: childArray[index], slug, status: 'resolved' as const }))
    .filter((panel) => !closedSlugs.has(panel.slug));
  const resolvedBySlug = new Map(resolvedPanels.map((panel) => [panel.slug, panel]));
  const visibleSlugs = resolvedPanels.map((panel) => panel.slug);
  const showSkeleton = Boolean(pendingAppend);
  const renderedSlugs = showSkeleton && pendingAppend ? pendingAppend.slugs : visibleSlugs;
  const renderedPanels = renderedSlugs.flatMap((slug): RenderedPanel[] => {
    const resolved = resolvedBySlug.get(slug);

    if (resolved) return [resolved];

    if (showSkeleton && pendingAppend?.targetSlug === slug) {
      return [{
        content: (
          <NotePanelSkeleton key={slug} slug={slug} state={pendingAppend.phase === 'loading' ? 'loading' : 'blank'} />
        ),
        slug,
        status: 'pending',
      }];
    }

    return [];
  });
  const activeMobilePanel = renderedPanels[renderedPanels.length - 1];
  const noteStackStyle = { '--note-spine-width': `${spineWidth}px` } as CSSProperties;
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
  const { activeSlug, activatePanel, clearPendingActiveSlug, setPendingActiveSlug, slugsKey } = useActiveNotePanel({
    slugs: renderedSlugs,
  });
  const handleNavigation = (navigation: StackNavigation) => {
    const previousActiveSlug = activeSlug;
    const started = navigate(navigation, () => {
      clearPendingActiveSlug();

      if (previousActiveSlug) activatePanel(previousActiveSlug);
    });

    if (started && navigation.targetSlug) setPendingActiveSlug(navigation.targetSlug);
  };
  const requestPanelFocus = (slug: string) => {
    focusRequestId.current += 1;
    setFocusRequest({ id: focusRequestId.current, slug });
  };
  const withKeyboardNavigation = (action: () => void) => () => {
    if (isNavigationActive()) return;

    setKeyboardNavigating(true);

    if (keyboardNavigationTimer.current) window.clearTimeout(keyboardNavigationTimer.current);

    keyboardNavigationTimer.current = window.setTimeout(() => setKeyboardNavigating(false), 120);
    action();
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
    onNavigate: handleNavigation,
    panel: {
      activate: activatePanel,
      requestFocus: requestPanelFocus,
      scroll: scrollPanel,
      setManualFoldedSlugs,
    },
    stack: { activeSlug, autoSpineSlugs, manualFoldedSlugs, slugs: renderedSlugs },
  });
  const wikiLinkPrefetch = useWikiLinkPrefetch({ isMobile, slugs: visibleSlugs });
  const pendingLocked = isNavigating;
  const foldedSlugsKey = manualFoldedSlugs.join('\0');
  const loadingAnnouncement = pendingAppend?.phase === 'loading' ? (
    <span role="status" className={cn('sr-only')}>
      opening note…
    </span>
  ) : null;

  useEffect(() => {
    if (isMobile) return;

    const hasExplicitRequest = Boolean(focusRequest && focusRequest.id !== handledFocusRequestId.current);
    const targetSlug = hasExplicitRequest ? focusRequest?.slug : activeSlug;

    if (!targetSlug || pendingAppend?.targetSlug === targetSlug) return;

    const frame = window.requestAnimationFrame(() => {
      focusPanel(targetSlug);

      if (hasExplicitRequest && focusRequest) handledFocusRequestId.current = focusRequest.id;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeSlug, focusPanel, focusRequest, foldedSlugsKey, isMobile, pendingAppend?.targetSlug, slugsKey]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (isNavigationActive()) {
      const pendingAction = target.closest('a.wiki-link, [data-fold-slug], [data-unfold-slug], [data-close-slug]');

      if (pendingAction) event.preventDefault();

      return;
    }

    const command = getNotePanelCommand(target);

    if ('panelSlug' in command && command.panelSlug) activatePanel(command.panelSlug);

    if (command.type === 'open') {
      event.preventDefault();
      pushToStack(visibleSlugs.indexOf(command.panelSlug), command.targetSlug);
    } else if (command.type === 'fold') {
      foldPanel(command.slug);
    } else if (command.type === 'unfold') {
      focusExistingPanel(command.slug);
    } else if (command.type === 'close') {
      closeAndActivatePanel(command.slug);
    } else if (command.type === 'activate') {
      activatePanel(command.slug);
    }
  };

  const handleMobileClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const command = getNotePanelCommand(event.target as HTMLElement);

    if (command.type !== 'open') return;

    event.preventDefault();

    if (isNavigationActive()) return;

    handleNavigation({
      kind: 'append',
      slugs: getMobileStackSlugs({ slugs: visibleSlugs, targetSlug: command.targetSlug }),
      targetSlug: command.targetSlug,
    });
  };

  useShortcuts(
    [
      { key: 'j', onTrigger: withKeyboardNavigation(() => scrollActivePanel(1)) },
      { key: 'k', onTrigger: withKeyboardNavigation(() => scrollActivePanel(-1)) },
      { key: 'h', onTrigger: withKeyboardNavigation(() => moveActivePanel(-1)) },
      { key: 'ArrowLeft', onTrigger: withKeyboardNavigation(() => moveActivePanel(-1)) },
      { key: 'l', onTrigger: withKeyboardNavigation(() => moveActivePanel(1)) },
      { key: 'ArrowRight', onTrigger: withKeyboardNavigation(() => moveActivePanel(1)) },
      { key: 'f', onTrigger: withKeyboardNavigation(toggleActiveFold) },
      { key: 'x', onTrigger: withKeyboardNavigation(closeActivePanel) },
      {
        key: 'Escape',
        onTrigger: withKeyboardNavigation(() => {
          if (visibleSlugs.length > 1) closePanel(visibleSlugs[visibleSlugs.length - 1]);
        }),
      },
    ],
    { enabled: !modalOpen && !isMobile && !pendingLocked },
  );

  useEffect(() => {
    const stackSlugs = slugsKey ? slugsKey.split('\0') : [];

    setManualFoldedSlugs((current) => pruneFoldedSlugs(current, stackSlugs));
  }, [slugsKey]);

  useEffect(
    () => () => {
      if (keyboardNavigationTimer.current) window.clearTimeout(keyboardNavigationTimer.current);
    },
    [],
  );

  if (isMobile) {
    return (
      <>
        <div
          data-note-mobile-stack="true"
          aria-busy={pendingLocked}
          onClick={handleMobileClick}
          onFocusCapture={wikiLinkPrefetch.onFocus}
          onPointerOver={wikiLinkPrefetch.onPointerOver}
          className={cn('h-full overflow-y-auto tui-scroll')}
        >
          {activeMobilePanel?.content}
        </div>
        {loadingAnnouncement}
      </>
    );
  }

  const foldedSlugs = new Set(manualFoldedSlugs);
  const spineSlugs = new Set(autoSpineSlugs);

  return (
    <>
      <div
        className={cn('h-full border-t-1 border-vague-line overflow-hidden')}
        aria-busy={pendingLocked}
        data-keyboard-navigation={keyboardNavigating}
        onClick={handleClick}
        onFocusCapture={wikiLinkPrefetch.onFocus}
        onPointerOver={wikiLinkPrefetch.onPointerOver}
        style={noteStackStyle}
      >
        <div ref={containerRef} className={cn('flex h-full overflow-x-auto tui-scroll')}>
          {renderedPanels.map((panel, index) => (
            <div
              key={panel.slug}
              data-stack-panel
              data-stack-slug={panel.slug}
              data-panel-status={panel.status}
              data-folded={foldedSlugs.has(panel.slug)}
              data-auto-spine={spineSlugs.has(panel.slug)}
              data-active={panel.slug === activeSlug}
              data-single-panel={renderedPanels.length === 1}
              data-active-visible={renderedPanels.length > 1 && panel.slug === activeSlug}
              className={cn('sticky shrink-0')}
              style={{ left: index * spineWidth, zIndex: index + 1 }}
            >
              {panel.content}
            </div>
          ))}
        </div>
      </div>
      {loadingAnnouncement}
    </>
  );
};
