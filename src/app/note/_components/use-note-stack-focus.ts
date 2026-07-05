'use client';

import { type RefObject, useCallback, useEffect, useRef } from 'react';

import { getFocusScrollLeft, NOTE_SPINE_WIDTH, type PanelMetric } from './note-stack-model';

type UseNoteStackFocusArgs = {
  containerRef: RefObject<HTMLDivElement | null>;
  getPanelMetrics: () => PanelMetric[];
  spineWidth?: number;
  updateAutoSpines: () => void;
};

export const useNoteStackFocus = ({
  containerRef,
  getPanelMetrics,
  spineWidth = NOTE_SPINE_WIDTH,
  updateAutoSpines,
}: UseNoteStackFocusArgs) => {
  const autoSpineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getPanelElement = useCallback(
    (slug: string) =>
      Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[data-panel-slug]') ?? []).find(
        (el) => el.dataset.panelSlug === slug,
      ) ?? null,
    [containerRef],
  );

  const focusPanel = useCallback(
    (slug: string) => {
      const container = containerRef.current;
      const panel = getPanelElement(slug);
      const panels = getPanelMetrics();
      const targetIndex = panels.findIndex((panelMetric) => panelMetric.slug === slug);

      if (!container || !panel || targetIndex === -1) return;

      panel.focus({ preventScroll: true });
      container.scrollTo({ left: getFocusScrollLeft({ panels, spineWidth, targetIndex }), behavior: 'smooth' });

      if (autoSpineTimer.current) clearTimeout(autoSpineTimer.current);

      autoSpineTimer.current = setTimeout(updateAutoSpines, 450);
    },
    [containerRef, getPanelElement, getPanelMetrics, spineWidth, updateAutoSpines],
  );

  const scrollPanel = useCallback(
    (slug: string, direction: number) => {
      const scroller = getPanelElement(slug)?.querySelector<HTMLElement>('[data-note-scroll]');

      if (!scroller) return;

      scroller.scrollBy({ top: direction * Math.max(64, scroller.clientHeight * 0.18), behavior: 'auto' });
    },
    [getPanelElement],
  );

  useEffect(
    () => () => {
      if (autoSpineTimer.current) clearTimeout(autoSpineTimer.current);
    },
    [],
  );

  return { focusPanel, scrollPanel };
};
