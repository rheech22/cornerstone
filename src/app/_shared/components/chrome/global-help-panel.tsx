import { Kbd, Overlay, Window } from '@/shared/components/tui';
import { cn } from '@/shared/lib/cn';

import { GLOBAL_SHORTCUTS, type RouteChrome, type ShortcutHint } from './route-chrome';

export const HELP_PANEL_ID = 'help-panel';

type GlobalHelpPanelProps = {
  open: boolean;
  route: RouteChrome;
  onClose: () => void;
};

const ShortcutRows = ({ shortcuts }: { shortcuts: ShortcutHint[] }) => (
  <ul className={cn('flex flex-col gap-2')}>
    {shortcuts.map((shortcut) => (
      <li key={shortcut.label} className={cn('flex items-center justify-between gap-4')}>
        <span className={cn('flex flex-wrap gap-1')}>
          {shortcut.keys.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </span>
        <span className={cn('text-sm text-vague-muted')}>{shortcut.label}</span>
      </li>
    ))}
  </ul>
);

export const GlobalHelpPanel = ({ open, route, onClose }: GlobalHelpPanelProps) => (
  <Overlay open={open} onClose={onClose} label="keymaps" id={HELP_PANEL_ID}>
    <Window>
      <Window.Title>keymaps</Window.Title>
      <Window.Body>
        <div className={cn('flex flex-col gap-5')}>
          <section className={cn('flex flex-col gap-2')}>
            <h2 className={cn('text-xs uppercase tracking-[0.2em] text-vague-muted')}>global</h2>
            <ShortcutRows shortcuts={[...GLOBAL_SHORTCUTS, { keys: ['esc'], label: 'close modal' }]} />
          </section>
          <section className={cn('flex flex-col gap-2')}>
            <h2 className={cn('text-xs uppercase tracking-[0.2em] text-vague-muted')}>{route.id}</h2>
            <ShortcutRows shortcuts={route.shortcuts} />
          </section>
        </div>
      </Window.Body>
    </Window>
  </Overlay>
);
