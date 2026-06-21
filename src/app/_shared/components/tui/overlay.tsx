import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  id?: string;
  className?: string;
  children: ReactNode;
};

export const Overlay = ({ open, onClose, label, id, className, children }: OverlayProps) => {
  useShortcuts(open ? [{ key: 'Escape', onTrigger: onClose }] : []);

  return (
    <div hidden={!open}>
      <button
        type="button"
        aria-label={`close ${label}`}
        onClick={onClose}
        className={cn('fixed inset-0 z-40 bg-vague-bg/70 backdrop-blur-sm')}
      />
      <div className={cn('pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4')}>
        <div
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={cn('pointer-events-auto w-full max-w-sm', className)}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
