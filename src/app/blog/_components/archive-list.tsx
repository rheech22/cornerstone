'use client';

import { useRef, useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAppChrome } from '@/shared/components/chrome/app-chrome';
import { cn } from '@/shared/lib/cn';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

export type BlogArchiveRow = {
  slug: string;
  title: string;
  year: string;
  month: string;
  day: string;
  date: number;
  showYear: boolean;
  showMonth: boolean;
  borderStart: 'full' | 'year' | 'month';
};

type ArchiveListProps = {
  rows: BlogArchiveRow[];
};

const borderClassName = (row: BlogArchiveRow) => {
  if (row.borderStart === 'full') return 'after:left-0';
  if (row.borderStart === 'year') return 'after:left-[4.25rem] sm:after:left-[5rem]';

  return 'after:left-[8rem] sm:after:left-[9.25rem]';
};

export const ArchiveList = ({ rows }: ArchiveListProps) => {
  const router = useRouter();
  const { modalOpen } = useAppChrome();
  const listRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [browsing, setBrowsing] = useState(false);

  const focusRow = (index: number) => {
    const links = listRef.current?.querySelectorAll<HTMLAnchorElement>('[data-blog-row]');

    if (!links || links.length === 0) return;

    const nextIndex = Math.min(Math.max(index, 0), links.length - 1);

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    setBrowsing(true);
    links[nextIndex]?.focus({ preventScroll: true });
    links[nextIndex]?.scrollIntoView({ block: 'nearest' });
  };

  const moveRow = (delta: number) => focusRow(activeIndexRef.current + delta);

  const openActive = () => {
    const row = rows[activeIndexRef.current];

    if (row) router.push(`/blog/${row.slug}` as Route);
  };

  const activateRow = (index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
    setBrowsing(true);
  };

  useShortcuts(
    [
      { key: 'j', onTrigger: () => moveRow(1) },
      { key: 'ArrowDown', onTrigger: () => moveRow(1) },
      { key: 'k', onTrigger: () => moveRow(-1) },
      { key: 'ArrowUp', onTrigger: () => moveRow(-1) },
      { key: 'Enter', onTrigger: openActive },
    ],
    { enabled: !modalOpen },
  );

  return (
    <div ref={listRef} className={cn('group/archive border-t border-vague-line/70')}>
      {rows.map((row, index) => {
        const isActive = browsing && index === activeIndex;

        return (
          <Link
            key={`${row.date}-${row.slug}`}
            href={`/blog/${row.slug}` as Route}
            data-blog-row="true"
            tabIndex={index === activeIndex ? 0 : -1}
            onFocus={() => activateRow(index)}
            onMouseMove={() => activateRow(index)}
            className={cn(
              'group/row relative grid min-h-10 grid-cols-[4.25rem_3.75rem_2.5rem_minmax(0,1fr)] items-baseline gap-0 py-3 text-sm transition-colors duration-200 after:absolute after:right-0 after:bottom-0 after:h-px after:content-[""] focus:outline-none sm:grid-cols-[5rem_4.25rem_2.75rem_minmax(0,1fr)]',
              borderClassName(row),
              isActive ? 'after:bg-vague-muted' : 'after:bg-vague-line/70 hover:after:bg-vague-muted',
            )}
          >
            <span className={cn('tabular-nums text-vague-muted/70 transition-colors duration-200')}>
              {row.showYear ? row.year : ''}
            </span>
            <span className={cn('text-xs font-semibold tracking-[0.18em] text-vague-muted/70 transition-colors duration-200')}>
              {row.showMonth ? row.month : ''}
            </span>
            <span className={cn('tabular-nums text-vague-muted/70 transition-colors duration-200')}>{row.day}</span>
            <span
              className={cn(
                'min-w-0 text-right transition-colors duration-200',
                isActive
                  ? 'text-vague-fg-bright'
                  : browsing
                    ? 'text-vague-muted/35'
                    : 'text-vague-fg group-hover/archive:text-vague-muted/35 group-hover/row:text-vague-fg-bright',
              )}
            >
              {row.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
