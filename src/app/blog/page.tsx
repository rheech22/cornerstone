import type { Metadata } from 'next';

import { cn } from '@/shared/lib/cn';
import { getPostData } from '@/shared/lib/get-posts';

import { ArchiveList, type BlogArchiveRow } from './_components/archive-list';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type Post = ReturnType<typeof getPostData>[number];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const buildRows = (posts: Post[]): BlogArchiveRow[] => {
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

const BlogPage = async () => {
  const rows = buildRows(getPostData('blog'));

  return (
    <div className={cn('vague-select flex-1 bg-vague-bg text-vague-fg')}>
      <div className={cn('mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16')}>
        <ArchiveList rows={rows} />
      </div>
    </div>
  );
};

export default BlogPage;
