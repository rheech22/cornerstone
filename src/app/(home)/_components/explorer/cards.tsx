'use client';

import { type KeyboardEvent, type RefObject, useEffect } from 'react';

import { cn } from '@/shared/lib/cn';
import { formatUpdatedAt } from '@/shared/lib/date';

import type { DocEntry } from './types';

type CardsProps = {
  items: DocEntry[];
  activeIndex: number;
  listRef: RefObject<HTMLUListElement | null>;
  onHover: (index: number) => void;
  onOpen: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLUListElement>) => void;
};

export const Cards = ({ items, activeIndex, listRef, onHover, onOpen, onKeyDown }: CardsProps) => {
  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listRef]);

  if (items.length === 0) {
    return (
      <div className={cn('flex min-h-0 w-full flex-1 items-center justify-center p-6 text-sm text-vague-muted')}>
        결과 없음 — 검색어를 바꿔보세요
      </div>
    );
  }

  return (
    <ul
      ref={listRef}
      onKeyDown={onKeyDown}
      className={cn('tui-scroll flex min-h-0 w-full flex-1 flex-col overflow-y-auto py-2 md:border-r md:border-vague-line')}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const updated = formatUpdatedAt(item.updated);

        return (
          <li key={`${item.type}/${item.slug}`}>
            <button
              type="button"
              data-card
              onMouseMove={() => onHover(index)}
              onFocus={() => onHover(index)}
              onClick={() => onOpen(index)}
              aria-current={isActive}
              className={cn(
                'flex w-full flex-col gap-0.5 px-3 py-1.5 text-left focus:outline-none',
                isActive ? 'bg-vague-surface' : 'hover:bg-vague-surface/40',
              )}
            >
              <span className={cn('flex items-baseline gap-2')}>
                <span className={cn('w-3 shrink-0 text-vague-amber', isActive ? 'opacity-100' : 'opacity-0')}>
                  ▌
                </span>
                <span
                  className={cn('flex-1 truncate text-sm', isActive ? 'text-vague-fg-bright' : 'text-vague-fg')}
                >
                  {item.title}
                </span>
              </span>
              <span className={cn('flex min-w-0 items-center gap-2 pl-5 text-xs text-vague-muted md:hidden')}>
                <span className={cn('shrink-0', item.type === 'blog' ? 'text-vague-sand' : 'text-vague-mint')}>
                  {item.type}
                </span>
                {updated && <span className={cn('shrink-0 whitespace-nowrap')}>· {updated}</span>}
                {item.tags.length > 0 && (
                  <span className={cn('min-w-0 truncate text-vague-mauve')}>
                    {item.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ')}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
