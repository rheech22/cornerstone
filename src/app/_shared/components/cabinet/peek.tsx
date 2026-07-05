import type { RefObject } from 'react';

import { cn } from '@/shared/lib/cn';
import { formatUpdatedAt } from '@/shared/lib/date';
import type { DocEntry } from '@/shared/lib/explorer-types';

type PeekProps = {
  entry: DocEntry | null;
  html: string | null;
  loading: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export const Peek = ({ entry, html, loading, scrollRef }: PeekProps) => {
  if (!entry) {
    return (
      <div className={cn('hidden min-h-0 items-center justify-center p-6 text-sm text-vague-muted md:flex')}>
        카드를 선택하세요
      </div>
    );
  }

  const updated = formatUpdatedAt(entry.updated);

  return (
    <div
      ref={scrollRef}
      className={cn('tui-scroll hidden min-h-0 select-none flex-col overflow-y-auto bg-vague-bg p-4 md:flex')}
    >
      <p className={cn('text-[0.65rem] uppercase tracking-wider text-vague-muted')}>
        {entry.type}
      </p>
      <h2 className={cn('mt-1 text-base text-vague-fg-bright')}>{entry.title}</h2>
      <div className={cn('mt-1 flex flex-wrap items-center gap-2 text-xs')}>
        {updated && <span className={cn('text-vague-muted')}>updated {updated}</span>}
        {entry.tags.length > 0 && (
          <span className={cn('text-vague-mauve')}>{entry.tags.map((tag) => `#${tag}`).join(' ')}</span>
        )}
      </div>

      <div className={cn('mt-3 border-t border-vague-line pt-3')}>
        {loading || html === null ? (
          <p className={cn('text-sm text-vague-muted')}>{loading ? 'peeking…' : ''}</p>
        ) : (
          <div className={cn('peek-md')} inert dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>
    </div>
  );
};
