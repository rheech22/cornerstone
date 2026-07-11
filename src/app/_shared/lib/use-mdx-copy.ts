'use client';

import type { MouseEvent } from 'react';
import { useEffect, useRef } from 'react';

const resetButton = (button: HTMLButtonElement) => {
  button.dataset.copied = 'false';
  button.title = 'Copy to clipboard';
  button.setAttribute('aria-label', 'Copy to clipboard');

  const label = button.querySelector<HTMLElement>('[data-copy-label]');
  const copyIcon = button.querySelector<HTMLElement>('[data-copy-default]');
  const successIcon = button.querySelector<HTMLElement>('[data-copy-success]');

  if (label) label.textContent = 'Copy to clipboard';
  if (copyIcon) copyIcon.hidden = false;
  if (successIcon) successIcon.hidden = true;
};

export const useMdxCopy = () => {
  const timers = useRef(new Map<HTMLButtonElement, number>());

  const handleCopyClick = (event: MouseEvent<HTMLDivElement>): boolean => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-copy-code="true"]');

    if (!button) return false;

    event.preventDefault();
    const source = button.closest('.code-block')?.querySelector('code')?.textContent ?? '';

    void navigator.clipboard.writeText(source).then(() => {
      const existing = timers.current.get(button);

      if (existing !== undefined) window.clearTimeout(existing);

      button.dataset.copied = 'true';
      button.title = 'Copied!';
      button.setAttribute('aria-label', 'Copied!');

      const label = button.querySelector<HTMLElement>('[data-copy-label]');
      const copyIcon = button.querySelector<HTMLElement>('[data-copy-default]');
      const successIcon = button.querySelector<HTMLElement>('[data-copy-success]');

      if (label) label.textContent = 'Copied!';
      if (copyIcon) copyIcon.hidden = true;
      if (successIcon) successIcon.hidden = false;

      timers.current.set(button, window.setTimeout(() => {
        timers.current.delete(button);
        resetButton(button);
      }, 1000));
    }).catch(() => resetButton(button));

    return true;
  };

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  return handleCopyClick;
};
