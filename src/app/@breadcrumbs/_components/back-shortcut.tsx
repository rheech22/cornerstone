'use client';

import { useRouter } from 'next/navigation';

import { useShortcuts } from '@/shared/lib/use-shortcuts';

export const BackShortcut = () => {
  const router = useRouter();

  useShortcuts([{ key: 'Backspace', onTrigger: () => router.back() }]);

  return null;
};
