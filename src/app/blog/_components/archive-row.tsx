import type { Route } from 'next';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

import { type BlogArchiveRow, getArchiveBorderClassName } from './archive-model';

type ArchiveRowProps = {
  active: boolean;
  browsing: boolean;
  index: number;
  row: BlogArchiveRow;
  onActivate: (index: number) => void;
};

export const ArchiveRow = ({ active, browsing, index, row, onActivate }: ArchiveRowProps) => (
  <Link
    href={`/blog/${row.slug}` as Route}
    data-blog-row="true"
    data-wiki-type="blog"
    data-wiki-slug={row.slug}
    data-wiki-label={row.title}
    onFocus={() => onActivate(index)}
    onMouseEnter={() => onActivate(index)}
    className={cn(
      'wiki-link group/row relative grid min-h-10 grid-cols-[4.25rem_3.75rem_2.5rem_minmax(0,1fr)] items-baseline gap-0 py-3 text-sm transition-colors duration-200 after:absolute after:right-0 after:bottom-0 after:h-px after:content-[""] focus:outline-none sm:grid-cols-[5rem_4.25rem_2.75rem_minmax(0,1fr)]',
      getArchiveBorderClassName(row),
      active ? 'after:bg-vague-muted' : 'after:bg-vague-line/70 hover:after:bg-vague-muted',
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
        active
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
