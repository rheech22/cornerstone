import { cn } from '@/shared/lib/cn';

export const Banner = () => (
  <header className={cn('flex flex-col gap-2')}>
    <pre className={cn('text-sm leading-tight text-vague-accent')}>cnst.</pre>
    <p className={cn('pl-1 text-sm text-vague-muted')}>~ my public notes</p>
  </header>
);
