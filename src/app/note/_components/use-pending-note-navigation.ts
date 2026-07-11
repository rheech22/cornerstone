'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { buildNoteStackUrl, type StackNavigation } from './note-stack-model';

export type PendingAppend = {
  href: string;
  phase: 'delaying' | 'skeleton' | 'loading';
  startedAt: number;
  slugs: string[];
  targetSlug: string;
};

type PendingClose = {
  closedSlug: string;
};

type ActiveNavigation = {
  href: string;
  sourceHref: string;
};

type UsePendingNoteNavigationArgs = {
  currentHref: string;
  serverSlugs: string[];
};

const SKELETON_DELAY = 80;
const LOADING_DELAY = 200;

export const usePendingNoteNavigation = ({
  currentHref,
  serverSlugs,
}: UsePendingNoteNavigationArgs) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeNavigation, setActiveNavigation] = useState<ActiveNavigation | null>(null);
  const [pendingAppend, setPendingAppend] = useState<PendingAppend | null>(null);
  const [pendingClose, setPendingClose] = useState<PendingClose | null>(null);
  const activeNavigationRef = useRef(activeNavigation);
  const rollbackRef = useRef<(() => void) | null>(null);
  const pendingRef = useRef(pendingAppend);

  activeNavigationRef.current = activeNavigation;
  pendingRef.current = pendingAppend;

  const navigate = (navigation: StackNavigation, onRollback: () => void) => {
    if (activeNavigationRef.current) return;

    const href = buildNoteStackUrl(navigation.slugs);

    rollbackRef.current = onRollback;
    setActiveNavigation({ href, sourceHref: currentHref });

    if (navigation.kind === 'append' && !serverSlugs.includes(navigation.targetSlug)) {
      setPendingAppend({
        href,
        phase: 'delaying',
        startedAt: performance.now(),
        slugs: navigation.slugs,
        targetSlug: navigation.targetSlug,
      });
    }

    if (navigation.kind === 'close') {
      setPendingClose({ closedSlug: navigation.closedSlug });
    }

    startTransition(() => router.push(href));
  };

  useEffect(() => {
    if (!activeNavigation) return;

    const completed = !isPending && currentHref === activeNavigation.href;
    const cancelled = !isPending && currentHref === activeNavigation.sourceHref;
    const superseded = currentHref !== activeNavigation.sourceHref && currentHref !== activeNavigation.href;

    if (!completed && !cancelled && !superseded) return;

    setActiveNavigation(null);
    setPendingAppend(null);
    setPendingClose(null);

    if (!completed && (cancelled || superseded)) rollbackRef.current?.();

    rollbackRef.current = null;
  }, [activeNavigation, currentHref, isPending]);

  useEffect(() => {
    if (!pendingAppend || pendingAppend.phase !== 'delaying') return;

    const remaining = Math.max(0, SKELETON_DELAY - (performance.now() - pendingAppend.startedAt));
    const timer = window.setTimeout(() => {
      const current = pendingRef.current;

      if (!current || current.href !== pendingAppend.href || current.phase !== 'delaying') return;

      setPendingAppend({ ...current, phase: 'skeleton' });
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [pendingAppend]);

  useEffect(() => {
    if (!pendingAppend || pendingAppend.phase !== 'skeleton') return;

    const remaining = Math.max(0, LOADING_DELAY - (performance.now() - pendingAppend.startedAt));
    const timer = window.setTimeout(() => {
      const current = pendingRef.current;

      if (!current || current.href !== pendingAppend.href || current.phase !== 'skeleton') return;

      setPendingAppend({ ...current, phase: 'loading' });
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [pendingAppend]);

  return {
    isNavigating: Boolean(activeNavigation),
    navigate,
    optimisticallyClosedSlugs: pendingClose ? [pendingClose.closedSlug] : [],
    pendingAppend,
  };
};
