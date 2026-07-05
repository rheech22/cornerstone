import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd
    className={cn(
      'rounded border border-vague-line bg-vague-bg px-1.5 py-0.5 text-xs text-vague-amber',
    )}
  >
    {children}
  </kbd>
);
