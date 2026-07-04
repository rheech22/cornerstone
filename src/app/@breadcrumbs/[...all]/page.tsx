import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

import { ArrowLeftIcon } from '../_components/arrow-left';
import { BackShortcut } from '../_components/back-shortcut';

const Page = () => (
  <header className={cn('flex justify-start p-3')}>
    <BackShortcut />
    <Link
      href="/"
      aria-label="Go home"
      title="Home"
      className={cn('inline-flex items-center justify-center')}
    >
      <ArrowLeftIcon size={20} />
    </Link>
  </header>
);

export default Page;
