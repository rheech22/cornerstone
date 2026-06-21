import { cn } from '@/shared/lib/cn';

export const StatusLine = () => (
  <footer className={cn('flex items-center justify-between gap-3 bg-vague-statusline px-3 py-1.5 text-xs text-vague-muted')}>
    <span className={cn('bg-vague-accent px-2 font-semibold text-vague-bg')}>NORMAL</span>
    <span className={cn('flex-1 text-right')}>~/cornerstone</span>
  </footer>
);
