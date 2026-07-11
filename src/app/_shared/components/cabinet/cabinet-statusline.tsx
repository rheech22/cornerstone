import { Kbd } from '@/shared/components/tui';
import { cn } from '@/shared/lib/cn';

const SHORTCUTS = [
  { keys: ['↑↓', 'ctrl+jk'], label: 'move' },
  { keys: ['enter'], label: 'open' },
  { keys: ['esc'], label: 'close' },
];

export const CabinetStatusline = () => (
  <div
    className={cn(
      'flex min-h-7 items-center rounded-b-md border-t border-vague-line bg-vague-statusline px-3 py-1.5 text-xs text-vague-muted',
    )}
  >
    <div className={cn('ml-auto hidden items-center gap-3 md:flex')}>
      {SHORTCUTS.map((shortcut) => (
        <span key={shortcut.label} className={cn('flex items-center gap-1.5')}>
          <span className={cn('flex items-center gap-1')}>
            {shortcut.keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </span>
          <span className={cn('text-[0.65rem] uppercase tracking-[0.12em] text-vague-muted/70')}>{shortcut.label}</span>
        </span>
      ))}
    </div>
  </div>
);
