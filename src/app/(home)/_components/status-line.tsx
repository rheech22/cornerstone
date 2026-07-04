'use client';

import { cn } from '@/shared/lib/cn';

import { HELP_PANEL_ID } from './help-panel';

type StatusLineProps = {
  helpOpen: boolean;
  onToggleHelp: () => void;
};

export const StatusLine = ({ helpOpen, onToggleHelp }: StatusLineProps) => (
  <footer className={cn('flex items-center justify-between gap-3 bg-vague-statusline px-3 py-1.5 text-xs text-vague-muted')}>
    <span className={cn('flex-1 text-left')}>~/cornerstone</span>
    <button
      type="button"
      onClick={onToggleHelp}
      aria-expanded={helpOpen}
      aria-controls={HELP_PANEL_ID}
      className={cn('transition-colors hover:text-vague-fg')}
    >
      <span className={cn('text-vague-amber')}>?</span> help
    </button>
  </footer>
);
