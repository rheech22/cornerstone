'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';

import { getAutoSpineSlugs, NOTE_SPINE_WIDTH, type PanelMetric, sameSlugs } from './note-stack-model';

type UseAutoSpinesArgs = {
  containerRef: RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  manualFoldedSlugs: string[];
  spineWidth?: number;
};

export const useAutoSpines = ({
  containerRef,
  isMobile,
  manualFoldedSlugs,
  spineWidth = NOTE_SPINE_WIDTH,
}: UseAutoSpinesArgs) => {
  const [autoSpineSlugs, setAutoSpineSlugs] = useState<string[]>([]);

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
  }, [containerRef]);

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
  }, [containerRef, getPanelMetrics, manualFoldedSlugs, spineWidth]);

  useEffect(() => {
    if (isMobile) return;

    const container = containerRef.current;

    if (!container) return;

    let frame = 0;
    const observer = new ResizeObserver(updateAutoSpines);
    const onScroll = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateAutoSpines();
      });
    };

    updateAutoSpines();
    container.addEventListener('scroll', onScroll, { passive: true });
    observer.observe(container);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      container.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [containerRef, isMobile, updateAutoSpines]);

  useEffect(() => {
    if (!isMobile) updateAutoSpines();
  }, [isMobile, manualFoldedSlugs, updateAutoSpines]);

  return { autoSpineSlugs, getPanelMetrics, updateAutoSpines };
};
