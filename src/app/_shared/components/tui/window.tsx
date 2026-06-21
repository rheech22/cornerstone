import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

const Root = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section
    className={cn(
      'relative rounded-md border border-vague-border bg-vague-surface font-mono text-vague-fg shadow-xl',
      className,
    )}
  >
    {children}
  </section>
);

const Title = ({ children }: { children: ReactNode }) => (
  <span className={cn('absolute -top-2 left-3 bg-vague-surface px-2 text-xs text-vague-mauve')}>
    {children}
  </span>
);

const Prompt = ({ children, symbol = '❯' }: { children?: ReactNode; symbol?: string }) => (
  <div className={cn('flex items-center gap-2 border-b border-vague-line px-3 py-2 text-sm')}>
    <span className={cn('text-vague-amber')}>{symbol}</span>
    <span className={cn('flex-1 text-vague-fg')}>{children}</span>
  </div>
);

const Body = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('max-h-[70vh] overflow-y-auto p-3', className)}>{children}</div>
);

const Footer = ({ children }: { children: ReactNode }) => (
  <div
    className={cn(
      'flex items-center gap-2 border-t border-vague-line px-3 py-1.5 text-xs text-vague-muted',
    )}
  >
    {children}
  </div>
);

export const Window = Object.assign(Root, { Title, Prompt, Body, Footer });
