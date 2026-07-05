import { cn } from '@/shared/lib/cn';

import { HELP_PANEL_ID } from './global-help-panel';
import type { RouteChrome } from './route-chrome';

type GlobalStatusBarProps = {
  helpOpen: boolean;
  route: RouteChrome;
  onToggleHelp: () => void;
};

export const GlobalStatusBar = ({ helpOpen, route, onToggleHelp }: GlobalStatusBarProps) => (
  <footer className={cn('flex items-center justify-between gap-3 bg-vague-statusline px-3 py-1.5 text-xs text-vague-muted')}>
    <span className={cn('min-w-0 flex-1 truncate text-left')}>{route.label}</span>
    <div className={cn('flex items-center')}>
      <button
        type="button"
        onClick={onToggleHelp}
        aria-expanded={helpOpen}
        aria-controls={HELP_PANEL_ID}
        className={cn('transition-colors hover:text-vague-fg')}
      >
        <span className={cn('text-vague-amber')}>?</span> help
      </button>
    </div>
  </footer>
);
