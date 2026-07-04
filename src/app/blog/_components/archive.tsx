'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/shared/lib/cn';

export type ArchivePost = {
  slug: string;
  metadata: { title: string };
};

export type ArchiveYear = {
  year: number;
  months: {
    month: number;
    days: { day: number; posts: ArchivePost[] }[];
  }[];
};

type ArchiveProps = {
  archive: ArchiveYear[];
};

const Chevron = ({ open }: { open: boolean }) => (
  <motion.svg
    animate={{ rotate: open ? 90 : 0 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </motion.svg>
);

const MonthLabel = ({ year, month }: { year: number; month: number }) => (
  <span className={cn('text-xs font-bold uppercase tracking-wider text-vague-muted')}>
    {format(new Date(year, month - 1, 1), "MMM")}
  </span>
);

export const Archive = ({ archive }: ArchiveProps) => {
  const [openYears, setOpenYears] = useState<Set<number>>(
    () => new Set(archive.map((y) => y.year)),
  );

  const toggle = (year: number) =>
    setOpenYears((prev) => {
      const next = new Set(prev);

      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }

      return next;
    });

  return (
    <div className={cn('flex flex-col gap-12')}>
      {archive.map(({ year, months }) => {
        const postCount = months.reduce(
          (n, m) => n + m.days.reduce((d, day) => d + day.posts.length, 0),
          0,
        );
        const isOpen = openYears.has(year);
        const panelId = `archive-year-${year}`;

        return (
          <motion.section
            key={year}
            layout="position"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <button
              type="button"
              onClick={() => toggle(year)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className={cn(
                'group flex w-full items-baseline justify-between py-3 transition-colors hover:text-vague-accent',
              )}
            >
              <span className={cn('flex items-baseline gap-3')}>
                <h2 className={cn('text-xl font-semibold tabular-nums text-vague-fg group-hover:text-vague-accent')}>
                  {year}
                </h2>
                <span className={cn('text-xs tabular-nums text-vague-muted')}>
                  {postCount} {postCount === 1 ? "post" : "posts"}
                </span>
              </span>
              <span className={cn('text-vague-muted group-hover:text-vague-accent')}>
                <Chevron open={isOpen} />
              </span>
            </button>
            <div className={cn('border-b border-vague-border/40')} />
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className={cn('pt-2')}>
                    {months.map(({ month, days }, monthIdx) => {
                      const totalRows = days.reduce(
                        (n, d) => n + d.posts.length,
                        0,
                      );

                      return (
                        <div
                          key={month}
                          className={cn(
                            'grid grid-cols-[2.5rem_1.75rem_1fr] py-3 sm:grid-cols-[3rem_1.75rem_1fr]',
                            monthIdx > 0 && 'border-t border-vague-line',
                          )}
                        >
                          <div
                            style={{ gridRow: `span ${totalRows}` }}
                            className={cn('flex items-start pr-1 pt-1')}
                          >
                            <MonthLabel year={year} month={month} />
                          </div>
                          {days.map(({ day, posts }) => (
                            <Fragment key={day}>
                              <div
                                style={{ gridRow: `span ${posts.length}` }}
                                className={cn(
                                  'flex items-start justify-end pr-6 pt-1 text-sm tabular-nums text-vague-fg/80',
                                )}
                              >
                                {day}
                              </div>
                              {posts.map((post) => (
                                <Link
                                  key={post.slug}
                                  href={`/blog/${post.slug}`}
                                  className={cn(
                                    'flex items-start py-1 text-sm font-medium text-vague-fg transition-colors hover:text-vague-fg-bright',
                                  )}
                                >
                                  {post.metadata.title}
                                </Link>
                              ))}
                            </Fragment>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        );
      })}
    </div>
  );
};
