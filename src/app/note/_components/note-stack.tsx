'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Children, memo, useEffect, useMemo, useRef, useState } from 'react';

import { useAppChrome } from '@/shared/components/chrome/app-chrome';
import { WikiPreviewScope } from '@/shared/components/wiki-preview/wiki-preview-scope';
import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { NotePanelSkeleton } from './note-panel';
import { NOTE_PANEL_ARTIFACT_VERSION } from './note-panel-artifact';
import { useNotePanelCache } from './note-panel-cache-provider';
import { getNotePanelCommand } from './note-stack-command';
import { getMobileStackSlugs, NOTE_SPINE_WIDTH, type StackNavigation } from './note-stack-model';
import { pruneFoldedSlugs, useActiveNotePanel } from './use-active-note-panel';
import { useAutoSpines } from './use-auto-spines';
import { type ClientNotePanel, useClientNoteNavigation } from './use-client-note-navigation';
import { useNoteStackActions } from './use-note-stack-actions';
import { useNoteStackFocus } from './use-note-stack-focus';
import { useWikiLinkPrefetch } from './use-wiki-link-prefetch';

type NoteStackProps = {
  slugs: string[];
  children: ReactNode;
  spineWidth?: number;
};

const PanelContent = memo(function PanelContent({ panel }: { panel: ClientNotePanel }) {
  if (panel.status === 'server') return panel.content;

  if (panel.status === 'artifact') {
    return <div className={cn('contents')} dangerouslySetInnerHTML={{ __html: panel.artifact.html }} />;
  }

  return <NotePanelSkeleton slug={panel.slug} state={panel.phase} />;
});

type PanelSlotProps = {
  active: boolean;
  autoSpine: boolean;
  folded: boolean;
  index: number;
  panel: ClientNotePanel;
  single: boolean;
  spineWidth: number;
};

const PanelSlot = memo(function PanelSlot({ active, autoSpine, folded, index, panel, single, spineWidth }: PanelSlotProps) {
  return (
    <div
      data-stack-panel
      data-stack-slug={panel.slug}
      data-panel-status={panel.status}
      data-folded={folded}
      data-auto-spine={autoSpine}
      data-active={active}
      data-single-panel={single}
      data-active-visible={!single && active}
      className={cn('sticky shrink-0')}
      style={{ left: index * spineWidth, zIndex: index + 1 }}
    >
      <PanelContent panel={panel} />
    </div>
  );
});

export const NoteStack = ({ slugs, children, spineWidth = NOTE_SPINE_WIDTH }: NoteStackProps) => {
  const { modalOpen } = useAppChrome();
  const cache = useNotePanelCache();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const stackRootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const focusRequestId = useRef(0);
  const handledFocusRequestId = useRef(0);
  const keyboardNavigationTimer = useRef<number | null>(null);
  const [manualFoldedSlugs, setManualFoldedSlugs] = useState<string[]>([]);
  const [focusRequest, setFocusRequest] = useState<{ id: number; slug: string } | null>(null);
  const [keyboardNavigating, setKeyboardNavigating] = useState(false);
  const initialPanels = useMemo<ClientNotePanel[]>(() => {
    const childArray = Children.toArray(children);

    return slugs.map((slug, index) => ({
      content: childArray[index],
      slug,
      status: 'server',
    }));
  }, [children, slugs]);
  const { isNavigating, isNavigationActive, navigate, panels } = useClientNoteNavigation({ cache, initialPanels });
  const renderedSlugs = panels.map((panel) => panel.slug);
  const activeMobilePanel = panels[panels.length - 1];
  const pendingTargetSlug = panels.find((panel) => panel.status === 'pending')?.slug;
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
  const { activeSlug, activatePanel, setPendingActiveSlug, slugsKey } = useActiveNotePanel({ slugs: renderedSlugs });
  const handleNavigation = (navigation: StackNavigation) => {
    const started = navigate(navigation);

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
  const wikiLinkPrefetch = useWikiLinkPrefetch({ isMobile });
  const foldedSlugsKey = manualFoldedSlugs.join('\0');
  const loadingAnnouncement = (
    <span role="status" className={cn('sr-only')}>{isNavigating ? 'opening note…' : ''}</span>
  );

  useEffect(() => {
    const root = stackRootRef.current;

    if (!root) return;

    root.querySelectorAll<HTMLElement>('.note-panel:not(.note-panel-skeleton)[data-panel-slug]').forEach((panel) => {
      const slug = panel.dataset.panelSlug;

      if (slug && !cache.has(slug)) cache.seed({ html: panel.outerHTML, slug, version: NOTE_PANEL_ARTIFACT_VERSION });
    });
    cache.pin(slugsKey ? slugsKey.split('\0') : []);
  }, [cache, slugsKey]);

  useEffect(() => {
    if (isMobile) return;

    const hasExplicitRequest = Boolean(focusRequest && focusRequest.id !== handledFocusRequestId.current);
    const targetSlug = hasExplicitRequest ? focusRequest?.slug : activeSlug;

    if (!targetSlug || pendingTargetSlug === targetSlug) return;

    const frame = window.requestAnimationFrame(() => {
      focusPanel(targetSlug);

      if (hasExplicitRequest && focusRequest) handledFocusRequestId.current = focusRequest.id;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeSlug, focusPanel, focusRequest, foldedSlugsKey, isMobile, pendingTargetSlug, slugsKey]);

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
      pushToStack(renderedSlugs.indexOf(command.panelSlug), command.targetSlug);
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
      slugs: getMobileStackSlugs({ slugs: renderedSlugs, targetSlug: command.targetSlug }),
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
          if (renderedSlugs.length > 1) closePanel(renderedSlugs[renderedSlugs.length - 1]);
        }),
      },
    ],
    { enabled: !modalOpen && !isMobile && !isNavigating },
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
      <WikiPreviewScope>
        <div
          ref={stackRootRef}
          data-note-mobile-stack="true"
          data-panel-status={activeMobilePanel?.status}
          data-stack-slug={activeMobilePanel?.slug}
          aria-busy={isNavigating}
          onClick={handleMobileClick}
          onFocusCapture={wikiLinkPrefetch.onFocus}
          onPointerOver={wikiLinkPrefetch.onPointerOver}
          className={cn('h-full overflow-y-auto tui-scroll')}
        >
          {activeMobilePanel && <PanelContent panel={activeMobilePanel} />}
        </div>
        {loadingAnnouncement}
      </WikiPreviewScope>
    );
  }

  const foldedSlugs = new Set(manualFoldedSlugs);
  const spineSlugs = new Set(autoSpineSlugs);

  return (
    <WikiPreviewScope>
      <div
        ref={stackRootRef}
        className={cn('h-full border-t-1 border-vague-line overflow-hidden')}
        aria-busy={isNavigating}
        data-keyboard-navigation={keyboardNavigating}
        onClick={handleClick}
        onFocusCapture={wikiLinkPrefetch.onFocus}
        onPointerOver={wikiLinkPrefetch.onPointerOver}
        style={noteStackStyle}
      >
        <div ref={containerRef} className={cn('flex h-full overflow-x-auto tui-scroll')}>
          {panels.map((panel, index) => (
            <PanelSlot
              key={panel.slug}
              active={panel.slug === activeSlug}
              autoSpine={spineSlugs.has(panel.slug)}
              folded={foldedSlugs.has(panel.slug)}
              index={index}
              panel={panel}
              single={panels.length === 1}
              spineWidth={spineWidth}
            />
          ))}
        </div>
      </div>
      {loadingAnnouncement}
    </WikiPreviewScope>
  );
};
