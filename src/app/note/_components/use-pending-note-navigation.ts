'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { buildNoteStackUrl, type StackNavigation } from './note-stack-model';

export type PendingAppend = {
  href: string;
  phase: 'skeleton' | 'loading';
  slugs: string[];
  targetSlug: string;
};

type NavigationAttempt = {
  href: string;
  id: number;
  loadingTimer: number | null;
  onRollback: () => void;
  shellTimer: number | null;
  sourceHref: string;
  timeoutTimer: number;
} & (
  | { kind: 'append'; slugs: string[]; targetSlug: string }
  | { closedSlug: string; kind: 'close' }
);

type UsePendingNoteNavigationArgs = {
  currentHref: string;
  serverSlugs: string[];
};

const SKELETON_DELAY = 100;
const LOADING_DELAY = 200;
const NAVIGATION_TIMEOUT = 15_000;

export const usePendingNoteNavigation = ({ currentHref, serverSlugs }: UsePendingNoteNavigationArgs) => {
  const router = useRouter();
  const attemptId = useRef(0);
  const attemptRef = useRef<NavigationAttempt | null>(null);
  const currentHrefRef = useRef(currentHref);
  const popStateTimer = useRef<number | null>(null);
  const [pendingAppend, setPendingAppend] = useState<PendingAppend | null>(null);
  const [pendingCloseSlug, setPendingCloseSlug] = useState('');

  currentHrefRef.current = currentHref;

  const clearAttemptTimers = useCallback((attempt: NavigationAttempt) => {
    if (attempt.shellTimer !== null) window.clearTimeout(attempt.shellTimer);
    if (attempt.loadingTimer !== null) window.clearTimeout(attempt.loadingTimer);
    window.clearTimeout(attempt.timeoutTimer);
  }, []);

  const finishAttempt = useCallback((id: number, rollback: boolean) => {
    const attempt = attemptRef.current;

    if (!attempt || attempt.id !== id) return;

    clearAttemptTimers(attempt);
    attemptRef.current = null;

    if (attempt.kind === 'append') setPendingAppend(null);
    else setPendingCloseSlug('');

    if (rollback) attempt.onRollback();
  }, [clearAttemptTimers]);

  const navigate = (navigation: StackNavigation, onRollback: () => void): boolean => {
    if (attemptRef.current) return false;

    const href = buildNoteStackUrl(navigation.slugs);

    if (href === currentHrefRef.current) return false;

    attemptId.current += 1;
    const id = attemptId.current;
    const baseAttempt = {
      href,
      id,
      loadingTimer: null,
      onRollback,
      shellTimer: null,
      sourceHref: currentHrefRef.current,
      timeoutTimer: window.setTimeout(() => finishAttempt(id, true), NAVIGATION_TIMEOUT),
    };
    const attempt: NavigationAttempt = navigation.kind === 'append'
      ? { ...baseAttempt, kind: 'append', slugs: navigation.slugs, targetSlug: navigation.targetSlug }
      : { ...baseAttempt, closedSlug: navigation.closedSlug, kind: 'close' };

    attemptRef.current = attempt;

    if (attempt.kind === 'append' && !serverSlugs.includes(attempt.targetSlug)) {
      attempt.shellTimer = window.setTimeout(() => {
        const current = attemptRef.current;

        if (!current || current.id !== id || current.kind !== 'append') return;

        setPendingAppend({ href: current.href, phase: 'skeleton', slugs: current.slugs, targetSlug: current.targetSlug });
      }, SKELETON_DELAY);
      attempt.loadingTimer = window.setTimeout(() => {
        const current = attemptRef.current;

        if (!current || current.id !== id || current.kind !== 'append') return;

        setPendingAppend({ href: current.href, phase: 'loading', slugs: current.slugs, targetSlug: current.targetSlug });
      }, LOADING_DELAY);
    }

    if (attempt.kind === 'close') setPendingCloseSlug(attempt.closedSlug);

    startTransition(() => router.push(href));

    return true;
  };

  const isNavigationActive = () => attemptRef.current !== null;

  useEffect(() => {
    const attempt = attemptRef.current;

    if (!attempt) return;

    if (currentHref === attempt.href) {
      finishAttempt(attempt.id, false);

      return;
    }

    if (currentHref !== attempt.sourceHref) finishAttempt(attempt.id, true);
  }, [currentHref, finishAttempt]);

  useEffect(() => {
    const onPopState = () => {
      const attempt = attemptRef.current;

      if (!attempt) return;

      popStateTimer.current = window.setTimeout(() => {
        const current = attemptRef.current;

        if (!current || current.id !== attempt.id) return;

        const href = `${window.location.pathname}${window.location.search}`;

        if (href !== current.href) finishAttempt(current.id, true);
      }, 0);
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);

      if (popStateTimer.current !== null) window.clearTimeout(popStateTimer.current);

      const attempt = attemptRef.current;

      if (attempt) clearAttemptTimers(attempt);

      attemptRef.current = null;
    };
  }, [clearAttemptTimers, finishAttempt]);

  return {
    isNavigating: Boolean(pendingAppend || pendingCloseSlug),
    isNavigationActive,
    navigate,
    optimisticallyClosedSlugs: pendingCloseSlug ? [pendingCloseSlug] : [],
    pendingAppend,
  };
};
