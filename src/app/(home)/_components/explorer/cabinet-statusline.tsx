import { cn } from '@/shared/lib/cn';

type CabinetStatuslineProps = {
  mode: 'BROWSE' | 'SEARCH';
  filterLabel: string;
  matched: number;
  total: number;
};

const HINTS = '@blog/note  #태그  ↑↓ 이동  ↵ 열기  esc 닫기';

export const CabinetStatusline = ({ mode, filterLabel, matched, total }: CabinetStatuslineProps) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-b-md border-t border-vague-line bg-vague-statusline px-3 py-1.5 text-xs',
    )}
  >
    <span className={cn('bg-vague-mauve px-2 font-semibold text-vague-bg')}>{`-- ${mode} --`}</span>
    <span className={cn('truncate text-vague-sand')}>{filterLabel}</span>
    <span className={cn('shrink-0 text-vague-muted')}>{`${matched} / ${total} slips`}</span>
    <span className={cn('ml-auto hidden shrink-0 text-vague-muted md:inline')}>{HINTS}</span>
  </div>
);
