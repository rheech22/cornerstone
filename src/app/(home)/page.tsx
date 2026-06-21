import { cn } from '@/shared/lib/cn';
import { buildExplorerIndex } from '@/shared/lib/explorer';

import { Banner } from './_components/banner';
import { Menu } from './_components/menu';
import { StatusLine } from './_components/status-line';

export default function HomePage() {
  const docs = buildExplorerIndex();

  return (
    <main className={cn('vague-select flex min-h-dvh flex-col bg-vague-bg font-mono text-vague-fg')}>
      <div className={cn('flex flex-1 items-center justify-center px-6')}>
        <div className={cn('flex w-full max-w-sm flex-col gap-10')}>
          <Banner />
          <Menu docs={docs} />
        </div>
      </div>
      <StatusLine />
    </main>
  );
}
