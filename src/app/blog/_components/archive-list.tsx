'use client';

import { useRef } from 'react';

import { cn } from '@/shared/lib/cn';

import type { BlogArchiveRow } from './archive-model';
import { ArchiveRow } from './archive-row';
import { useArchiveNavigation } from './use-archive-navigation';

export type { BlogArchiveRow } from './archive-model';

type ArchiveListProps = {
  rows: BlogArchiveRow[];
};

export const ArchiveList = ({ rows }: ArchiveListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const { activeIndex, activateRow, browsing } = useArchiveNavigation(listRef);

  return (
    <div ref={listRef} className={cn('group/archive border-t border-vague-line/70')}>
      {rows.map((row, index) => {
        const active = browsing && index === activeIndex;

        return (
          <ArchiveRow
            key={`${row.date}-${row.slug}`}
            active={active}
            browsing={browsing}
            index={index}
            row={row}
            onActivate={activateRow}
          />
        );
      })}
    </div>
  );
};
