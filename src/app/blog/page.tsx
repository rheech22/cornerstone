import type { Metadata } from 'next';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';
import { getPostData } from '@/shared/lib/get-posts';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type Post = ReturnType<typeof getPostData>[number];

type ArchiveRow = {
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

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const buildRows = (posts: Post[]): ArchiveRow[] => {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.metadata.created).getTime() - new Date(a.metadata.created).getTime(),
  );

  return sorted.map((post, index) => {
    const date = new Date(post.metadata.created);
    const previous = index > 0 ? sorted[index - 1] : undefined;
    const next = sorted[index + 1];
    const previousDate = previous ? new Date(previous.metadata.created) : undefined;
    const nextDate = next ? new Date(next.metadata.created) : undefined;
    const year = String(date.getFullYear());
    const month = MONTHS[date.getMonth()];
    const borderStart = (() => {
      if (!nextDate || nextDate.getFullYear() !== date.getFullYear()) return 'full';
      if (nextDate.getMonth() !== date.getMonth()) return 'year';

      return 'month';
    })();

    return {
      slug: post.slug,
      title: post.metadata.title,
      year,
      month,
      day: String(date.getDate()).padStart(2, '0'),
      date: date.getTime(),
      showYear: !previousDate || previousDate.getFullYear() !== date.getFullYear(),
      showMonth:
        !previousDate ||
        previousDate.getFullYear() !== date.getFullYear() ||
        previousDate.getMonth() !== date.getMonth(),
      borderStart,
    };
  });
};

const borderClassName = (row: ArchiveRow) => {
  if (row.borderStart === 'full') return 'after:left-0';
  if (row.borderStart === 'year') return 'after:left-[4.25rem] sm:after:left-[5rem]';

  return 'after:left-[8rem] sm:after:left-[9.25rem]';
};

const BlogPage = async () => {
  const rows = buildRows(getPostData('blog'));

  return (
    <div className={cn('vague-select flex-1 bg-vague-bg text-vague-fg')}>
      <div className={cn('mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16')}>
        <div className={cn('group/archive border-t border-vague-line/70')}>
          {rows.map((row) => (
            <Link
              key={`${row.date}-${row.slug}`}
              href={`/blog/${row.slug}`}
              className={cn(
                'group/row relative grid min-h-10 grid-cols-[4.25rem_3.75rem_2.5rem_minmax(0,1fr)] items-baseline gap-0 py-3 text-sm transition-colors duration-200 after:absolute after:right-0 after:bottom-0 after:h-px after:bg-vague-line/70 after:content-[""] hover:after:bg-vague-muted sm:grid-cols-[5rem_4.25rem_2.75rem_minmax(0,1fr)]',
                borderClassName(row),
              )}
            >
              <span
                className={cn(
                  'tabular-nums text-vague-muted/70 transition-colors duration-200',
                )}
              >
                {row.showYear ? row.year : ''}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold tracking-[0.18em] text-vague-muted/70 transition-colors duration-200',
                )}
              >
                {row.showMonth ? row.month : ''}
              </span>
              <span
                className={cn(
                  'tabular-nums text-vague-muted/70 transition-colors duration-200',
                )}
              >
                {row.day}
              </span>
              <span
                className={cn(
                  'min-w-0 text-right text-vague-fg transition-colors duration-200 group-hover/archive:text-vague-muted/35 group-hover/row:text-vague-fg-bright',
                )}
              >
                {row.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
