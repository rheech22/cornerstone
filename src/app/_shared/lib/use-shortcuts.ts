'use client';

import { useEffect, useRef } from 'react';

export type Shortcut = {
  key: string;
  onTrigger: () => void;
};

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export const useShortcuts = (shortcuts: Shortcut[]) => {
  const latest = useRef(shortcuts);

  latest.current = shortcuts;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      const match = latest.current.find((s) => s.key.toLowerCase() === event.key.toLowerCase());

      if (!match) return;

      event.preventDefault();
      match.onTrigger();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
};
