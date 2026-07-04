import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

import { ArrowLeftIcon } from './arrow-left';
import { BackShortcut } from './back-shortcut';

export const BlogBreadcrumbs = () => (
  <header className={cn('flex justify-start bg-vague-bg p-6 font-mono')}>
    <BackShortcut />
    <Link
      href="/"
      aria-label="Go home"
      title="Home"
      className={cn('inline-flex items-center justify-center text-vague-muted hover:text-vague-accent')}
    >
      <ArrowLeftIcon />
    </Link>
  </header>
);
