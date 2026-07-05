'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { ArrowLeftIcon } from './arrow-left';

const getMobileNoteBackUrl = () => {
  const url = new URL(window.location.href);
  const stack = url.searchParams.getAll('n');

  if (stack.length > 0) {
    const params = new URLSearchParams();

    stack.slice(0, -1).forEach((slug) => params.append('n', slug));

    const query = params.toString();

    return `${url.pathname}${query ? `?${query}` : ''}`;
  }

  if (url.pathname !== '/note') return '/note';

  return '/';
};

export const NoteBreadcrumbs = () => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const navigateBack = () => {
    if (isMobile) {
      router.push(getMobileNoteBackUrl() as Route);

      return;
    }

    router.back();
  };

  useShortcuts([{ key: 'Backspace', onTrigger: navigateBack }]);

  return (
    <header className={cn('flex justify-start bg-vague-bg p-3')}>
      {isMobile ? (
        <button
          type="button"
          aria-label="Go back"
          title="Back"
          onClick={navigateBack}
          className={cn('inline-flex items-center justify-center text-vague-muted hover:text-vague-accent')}
        >
          <ArrowLeftIcon size={20} />
        </button>
      ) : (
        <Link
          href="/"
          aria-label="Go home"
          title="Home"
          className={cn('inline-flex items-center justify-center text-vague-muted hover:text-vague-accent')}
        >
          <ArrowLeftIcon size={20} />
        </Link>
      )}
    </header>
  );
};
