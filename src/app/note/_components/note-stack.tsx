'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Children, useCallback, useEffect, useRef, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import {
  buildNoteStackUrl,
  getAutoSpineSlugs,
  getFocusScrollLeft,
  getMobileStackSlugs,
  getStackAction,
  NOTE_SPINE_WIDTH,
  type PanelMetric,
  sameSlugs,
  slugFromNoteHref,
} from './note-stack-model';

type NoteStackProps = {
  slugs: string[];
  children: ReactNode;
  spineWidth?: number;
};

export const NoteStack = ({ slugs, children, spineWidth = NOTE_SPINE_WIDTH }: NoteStackProps) => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLength = useRef(0);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSpineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [manualFoldedSlugs, setManualFoldedSlugs] = useState<string[]>([]);
  const [autoSpineSlugs, setAutoSpineSlugs] = useState<string[]>([]);

  const childArray = Children.toArray(children);
  const activeMobileChild = childArray[childArray.length - 1];
  const noteStackStyle = {
    '--note-spine-width': `${spineWidth}px`,
  } as CSSProperties;

  const getPanelMetrics = useCallback((): PanelMetric[] => {
    const container = containerRef.current;

    if (!container) return [];

    return Array.from(container.querySelectorAll<HTMLElement>('[data-stack-panel]'))
      .map((panel) => ({
        slug: panel.dataset.stackSlug ?? '',
        offsetLeft: panel.offsetLeft,
        offsetWidth: panel.offsetWidth,
      }))
      .filter((panel) => panel.slug.length > 0);
  }, []);

  const updateAutoSpines = useCallback(() => {
    const container = containerRef.current;

    if (!container) return;

    const selected = getAutoSpineSlugs({
      manualFoldedSlugs,
      panels: getPanelMetrics(),
      spineWidth,
      scrollLeft: container.scrollLeft,
    });

    setAutoSpineSlugs((current) => (sameSlugs(current, selected) ? current : selected));
  }, [getPanelMetrics, manualFoldedSlugs, spineWidth]);

  const focusPanel = useCallback(
    (slug: string) => {
      const container = containerRef.current;
      const panel = Array.from(container?.querySelectorAll<HTMLElement>('[data-panel-slug]') ?? []).find(
        (el) => el.dataset.panelSlug === slug,
      );
      const panels = getPanelMetrics();
      const targetIndex = panels.findIndex((panel) => panel.slug === slug);

      if (!container || !panel || targetIndex === -1) return;

      if (highlightTimer.current) clearTimeout(highlightTimer.current);

      panel.dataset.highlighted = 'true';
      container.scrollTo({ left: getFocusScrollLeft({ panels, spineWidth, targetIndex }), behavior: 'smooth' });

      if (autoSpineTimer.current) clearTimeout(autoSpineTimer.current);

      autoSpineTimer.current = setTimeout(updateAutoSpines, 450);
      highlightTimer.current = setTimeout(() => {
        delete panel.dataset.highlighted;
      }, 900);
    },
    [getPanelMetrics, spineWidth, updateAutoSpines],
  );

  const unfoldPanel = (slug: string) => {
    setManualFoldedSlugs((current) => current.filter((s) => s !== slug));
  };

  const focusExistingPanel = (slug: string) => {
    unfoldPanel(slug);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => focusPanel(slug));
    });
  };

  const pushToStack = (fromIndex: number, targetSlug: string) => {
    const action = getStackAction({ fromIndex, slugs, targetSlug });

    if (action.type === 'focus') {
      focusExistingPanel(action.slug);

      return;
    }

    if (action.type === 'navigate') {
      router.push(buildNoteStackUrl(action.slugs));
    }
  };

  const closePanel = (slug: string) => {
    const remaining = slugs.filter((s) => s !== slug);

    if (remaining.length === 0) {
      router.push('/note' as Route);

      return;
    }

    router.push(buildNoteStackUrl(remaining));
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    const link = target.closest('a.wiki-link');

    if (link) {
      e.preventDefault();

      const href = link.getAttribute('href') ?? '';
      const targetSlug = slugFromNoteHref(href);

      if (!targetSlug) return;

      const panel = target.closest('[data-panel-slug]') as HTMLElement | null;
      const panelSlug = panel?.getAttribute('data-panel-slug') ?? '';
      const fromIndex = slugs.indexOf(panelSlug);

      pushToStack(fromIndex, targetSlug);

      return;
    }

    const foldBtn = target.closest('[data-fold-slug]');

    if (foldBtn) {
      const slug = foldBtn.getAttribute('data-fold-slug');

      if (slug) {
        setManualFoldedSlugs((current) => (current.includes(slug) ? current : [...current, slug]));
      }

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

      if (slug) closePanel(slug);
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

  useShortcuts([
    {
      key: 'Escape',
      onTrigger: () => {
        if (slugs.length > 1) {
          closePanel(slugs[slugs.length - 1]);
        }
      },
    },
  ]);

  useEffect(() => {
    setManualFoldedSlugs((current) => current.filter((slug) => slugs.includes(slug)));
  }, [slugs]);

  useEffect(() => {
    if (isMobile) return;

    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(updateAutoSpines);

    updateAutoSpines();
    container.addEventListener('scroll', updateAutoSpines, { passive: true });
    observer.observe(container);

    return () => {
      container.removeEventListener('scroll', updateAutoSpines);
      observer.disconnect();
    };
  }, [isMobile, updateAutoSpines]);

  useEffect(() => {
    if (isMobile) return;

    updateAutoSpines();
  }, [isMobile, manualFoldedSlugs, updateAutoSpines]);

  useEffect(() => {
    if (isMobile) return;

    if (slugs.length <= prevLength.current) {
      prevLength.current = slugs.length;

      return;
    }

    prevLength.current = slugs.length;
    const container = containerRef.current;

    if (container) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
      updateAutoSpines();

      if (autoSpineTimer.current) clearTimeout(autoSpineTimer.current);

      autoSpineTimer.current = setTimeout(updateAutoSpines, 450);
    }
  }, [isMobile, slugs.length, updateAutoSpines]);

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      if (autoSpineTimer.current) clearTimeout(autoSpineTimer.current);
    },
    [],
  );

  if (isMobile) {
    return (
      <div data-note-mobile-stack="true" onClick={handleMobileClick} className={cn('h-full overflow-y-auto tui-scroll')}>
        {activeMobileChild}
      </div>
    );
  }

  return (
    <div className={cn('h-full overflow-hidden')} onClick={handleClick} style={noteStackStyle}>
      <div ref={containerRef} onScroll={updateAutoSpines} className={cn('flex h-full overflow-x-auto tui-scroll')}>
        {childArray.map((child, index) => {
          const slug = slugs[index];

          return (
            <div
              key={slug ?? index}
              data-stack-panel
              data-stack-slug={slug}
              data-folded={slug ? manualFoldedSlugs.includes(slug) : false}
              data-auto-spine={slug ? autoSpineSlugs.includes(slug) : false}
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
