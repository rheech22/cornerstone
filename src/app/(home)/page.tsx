import { cn } from '@/shared/lib/cn';

import { Banner } from './_components/banner';
import { Menu } from './_components/menu';
import { StatusLine } from './_components/status-line';

export default function HomePage() {
  return (
    <main className={cn('flex min-h-dvh flex-col bg-vague-bg font-mono text-vague-fg')}>
      <div className={cn('flex flex-1 items-center justify-center px-6')}>
        <div className={cn('flex w-full max-w-sm flex-col gap-10')}>
          <Banner />
          <Menu />
        </div>
      </div>
      <StatusLine />
    </main>
  );
}
