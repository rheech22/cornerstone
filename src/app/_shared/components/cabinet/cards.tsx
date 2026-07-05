'use client';

import { type KeyboardEvent, type RefObject, useEffect } from 'react';

import { cn } from '@/shared/lib/cn';
import { formatUpdatedAt } from '@/shared/lib/date';
import type { DocEntry } from '@/shared/lib/explorer-types';

type CardsProps = {
  items: DocEntry[];
  activeIndex: number;
  interactionMode: 'searching' | 'browsing';
  listRef: RefObject<HTMLUListElement | null>;
  onHover: (index: number) => void;
  onOpen: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLUListElement>) => void;
};

export const Cards = ({ items, activeIndex, interactionMode, listRef, onHover, onOpen, onKeyDown }: CardsProps) => {
  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listRef]);

  const isBrowsing = interactionMode === 'browsing';

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
      className={cn('tui-scroll tui-scroll-hidden flex min-h-0 w-full flex-1 flex-col overflow-y-auto')}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const isHighlighted = isBrowsing && isActive;
        const updated = formatUpdatedAt(item.updated);

        return (
          <li key={`${item.type}/${item.slug}`}>
            <button
              type="button"
              data-card
              onMouseEnter={() => onHover(index)}
              onFocus={() => onHover(index)}
              onClick={() => onOpen(index)}
              aria-current={isActive}
              className={cn(
                'flex w-full flex-col gap-0.5 px-3 py-1.5 text-left focus:outline-none',
                isHighlighted && 'bg-vague-bg',
              )}
            >
              <span className={cn('flex items-baseline')}>
                <span
                  className={cn(
                    'flex-1 truncate text-sm',
                    isHighlighted ? 'text-vague-fg-bright' : isBrowsing ? 'text-vague-muted/35' : 'text-vague-fg',
                  )}
                >
                  {item.title}
                </span>
              </span>
              <span className={cn('flex min-w-0 items-center gap-2 text-xs md:hidden')}>
                <span
                  className={cn(
                    'shrink-0',
                    isBrowsing && !isActive
                      ? 'text-vague-muted/30'
                      : item.type === 'blog'
                        ? 'text-vague-sand'
                        : 'text-vague-mint',
                  )}
                >
                  {item.type}
                </span>
                {updated && (
                  <span
                    className={cn(
                      'shrink-0 whitespace-nowrap',
                      isBrowsing && !isActive ? 'text-vague-muted/30' : 'text-vague-muted/70',
                    )}
                  >
                    · {updated}
                  </span>
                )}
                {item.tags.length > 0 && (
                  <span
                    className={cn(
                      'min-w-0 truncate',
                      isBrowsing && !isActive ? 'text-vague-muted/30' : 'text-vague-mauve',
                    )}
                  >
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
