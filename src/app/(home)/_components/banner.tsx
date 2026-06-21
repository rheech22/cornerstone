import { cn } from '@/shared/lib/cn';

const LOGO = ['╭───────────────╮', '│  cornerstone  │', '╰───────────────╯'].join('\n');

export const Banner = () => (
  <header className={cn('flex flex-col gap-3')}>
    <pre className={cn('text-sm leading-tight text-vague-accent')}>{LOGO}</pre>
    <p className={cn('pl-1 text-sm text-vague-muted')}>~ my public notes</p>
  </header>
);
