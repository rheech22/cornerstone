import { cn } from '@/shared/lib/cn';

export const EXPLORER_PANEL_ID = 'explorer-panel';

export const ExplorerPanel = ({ open }: { open: boolean }) => (
  <section
    id={EXPLORER_PANEL_ID}
    hidden={!open}
    className={cn('rounded-md border border-vague-surface px-3 py-2 text-sm text-vague-muted')}
  >
    <p className={cn('text-vague-accent')}>~/cornerstone</p>
  </section>
);
