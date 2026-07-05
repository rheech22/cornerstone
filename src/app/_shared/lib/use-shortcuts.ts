'use client';

import { useEffect, useRef } from 'react';

type KeyEventLike = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  preventDefault: () => void;
};

export type Shortcut = {
  /** Combo spec: `'ctrl+j'`, `'mod+k'`, `'ArrowDown'`, `'?'`, `'Escape'`. `mod` = ctrl or meta. */
  key: string;
  onTrigger: (event: KeyEventLike) => void;
  /** Only fire when this returns true — lets a keymap encode modal behavior declaratively. */
  when?: () => boolean;
  /** Defaults to true. */
  preventDefault?: boolean;
};

type Combo = { key: string; ctrl: boolean; meta: boolean; alt: boolean; shift: boolean; mod: boolean };

const parseCombo = (spec: string): Combo => {
  const parts = spec.toLowerCase().split('+');
  const key = parts.pop() ?? '';

  return {
    key,
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('meta'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    mod: parts.includes('mod'),
  };
};

const matches = (event: KeyEventLike, combo: Combo): boolean => {
  if (event.key.toLowerCase() !== combo.key) return false;

  if (combo.mod) {
    if (!event.ctrlKey && !event.metaKey) return false;
  } else {
    if (event.ctrlKey !== combo.ctrl) return false;
    if (event.metaKey !== combo.meta) return false;
  }

  if (event.altKey !== combo.alt) return false;
  if (combo.shift && !event.shiftKey) return false;

  return true;
};

/** Run the first matching, enabled shortcut against an event. Returns whether one fired. */
export const handleShortcuts = (event: KeyEventLike, shortcuts: Shortcut[]): boolean => {
  for (const shortcut of shortcuts) {
    if (shortcut.when && !shortcut.when()) continue;
    if (!matches(event, parseCombo(shortcut.key))) continue;

    if (shortcut.preventDefault !== false) event.preventDefault();
    shortcut.onTrigger(event);

    return true;
  }

  return false;
};

/** Build an `onKeyDown` handler from a keymap — attach to any element. */
export const keymap = (shortcuts: Shortcut[]) => (event: KeyEventLike) => {
  handleShortcuts(event, shortcuts);
};

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

type Options = { enabled?: boolean; ignoreEditable?: boolean };

/** Register a keymap on the window. Skips editable targets by default. */
export const useShortcuts = (shortcuts: Shortcut[], { enabled = true, ignoreEditable = true }: Options = {}) => {
  const latest = useRef(shortcuts);

  latest.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (ignoreEditable && isEditable(event.target)) return;

      handleShortcuts(event, latest.current);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, ignoreEditable]);
};
