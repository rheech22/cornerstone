import { cn } from '@/shared/lib/cn';

const HINTS = '↑↓/ctrl+jk 이동  ↵ 열기  esc 닫기';

export const CabinetStatusline = () => (
  <div
    className={cn(
      'flex items-center rounded-b-md border-t border-vague-line bg-vague-statusline px-3 py-1.5 text-xs',
    )}
  >
    <span className={cn('ml-auto hidden shrink-0 text-vague-muted md:inline')}>{HINTS}</span>
  </div>
);
