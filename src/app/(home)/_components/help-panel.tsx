import { Kbd, Overlay, Window } from '@/shared/components/tui';
import { cn } from '@/shared/lib/cn';

export const HELP_PANEL_ID = 'help-panel';

const KEYMAP = [
  { keys: ['j', 'k', '↓', '↑'], desc: 'move' },
  { keys: ['enter'], desc: 'open' },
  { keys: ['a', 'e', 'p', 'n', 's'], desc: 'jump to item' },
  { keys: ['?', '/'], desc: 'help' },
  { keys: ['esc'], desc: 'close' },
];

export const HelpPanel = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Overlay open={open} onClose={onClose} label="keymaps" id={HELP_PANEL_ID}>
    <Window>
      <Window.Title>keymaps</Window.Title>
      <Window.Body>
        <ul className={cn('flex flex-col gap-2')}>
          {KEYMAP.map((map) => (
            <li key={map.desc} className={cn('flex items-center justify-between gap-4')}>
              <span className={cn('flex gap-1')}>
                {map.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </span>
              <span className={cn('text-vague-muted text-sm')}>{map.desc}</span>
            </li>
          ))}
        </ul>
      </Window.Body>
    </Window>
  </Overlay>
);
