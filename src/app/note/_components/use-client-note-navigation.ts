'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { NotePanelArtifact } from './note-panel-artifact';
import type { NotePanelCache } from './note-panel-cache';
import { buildNoteStackUrl, parseNoteStackUrl, sameSlugs, type StackNavigation } from './note-stack-model';

export type ClientNotePanel =
  | { content: ReactNode; slug: string; status: 'server' }
  | { artifact: NotePanelArtifact; slug: string; status: 'artifact' }
  | { phase: 'blank' | 'loading'; slug: string; status: 'pending' };

type NavigationAttempt = {
  fallbackTimer?: number;
  id: number;
  loadingTimer: number;
  originalPanels: ClientNotePanel[];
  shellTimer: number;
  slugs: string[];
  targetSlug: string;
};

type UseClientNoteNavigationArgs = {
  cache: NotePanelCache;
  initialPanels: ClientNotePanel[];
};

const SHELL_DELAY = 100;
const LOADING_DELAY = 200;

const getPanelMap = (panels: ClientNotePanel[]) => new Map(panels.filter((panel) => panel.status !== 'pending').map((panel) => [panel.slug, panel]));

export const useClientNoteNavigation = ({ cache, initialPanels }: UseClientNoteNavigationArgs) => {
  const router = useRouter();
  const attemptId = useRef(0);
  const attemptRef = useRef<NavigationAttempt | null>(null);
  const historyGeneration = useRef(0);
  const panelsRef = useRef(initialPanels);
  const [navigationActive, setNavigationActive] = useState(false);
  const [panels, setPanels] = useState(initialPanels);

  panelsRef.current = panels;

  const updatePanels = useCallback((next: ClientNotePanel[]) => {
    panelsRef.current = next;
    setPanels(next);
    cache.pin(next.filter((panel) => panel.status !== 'pending').map((panel) => panel.slug));
  }, [cache]);

  const clearAttempt = useCallback((attempt: NavigationAttempt, updateState = true) => {
    if (attempt.fallbackTimer) window.clearTimeout(attempt.fallbackTimer);
    window.clearTimeout(attempt.shellTimer);
    window.clearTimeout(attempt.loadingTimer);

    if (attemptRef.current?.id === attempt.id) {
      attemptRef.current = null;
      if (updateState) setNavigationActive(false);
    }
  }, []);

  const panelsForSlugs = useCallback((slugs: string[], targetArtifact?: NotePanelArtifact): ClientNotePanel[] | null => {
    const current = getPanelMap(panelsRef.current);

    if (targetArtifact) current.set(targetArtifact.slug, { artifact: targetArtifact, slug: targetArtifact.slug, status: 'artifact' });

    const next = slugs.map((slug) => current.get(slug) ?? (() => {
      const artifact = cache.peek(slug);

      return artifact ? { artifact, slug, status: 'artifact' as const } : null;
    })());

    return next.every((panel) => panel !== null) ? next : null;
  }, [cache]);

  const commit = useCallback((next: ClientNotePanel[], pushHistory: boolean) => {
    updatePanels(next);

    if (pushHistory) window.history.pushState(null, '', buildNoteStackUrl(next.map((panel) => panel.slug)));
  }, [updatePanels]);

  const loadStack = useCallback(async (slugs: string[]): Promise<ClientNotePanel[]> => {
    const current = getPanelMap(panelsRef.current);
    const missing = slugs.filter((slug) => !current.has(slug) && !cache.peek(slug));

    await Promise.all(missing.map((slug) => cache.load(slug)));

    const next = panelsForSlugs(slugs);

    if (!next) throw new Error('failed to compose note stack');

    return next;
  }, [cache, panelsForSlugs]);

  const navigate = useCallback((navigation: StackNavigation): boolean => {
    if (attemptRef.current) return false;

    const targetSlugs = navigation.slugs.length > 0 ? navigation.slugs : ['index'];

    if (navigation.kind === 'close') {
      const next = panelsForSlugs(targetSlugs);

      if (next) {
        commit(next, true);

        return true;
      }

      void loadStack(targetSlugs)
        .then((loaded) => {
          commit(loaded, true);
        })
        .catch(() => router.push(buildNoteStackUrl(targetSlugs)));

      return true;
    }

    const cached = cache.peek(navigation.targetSlug);

    if (cached) {
      const next = panelsForSlugs(targetSlugs, cached);

      if (!next) return false;

      commit(next, true);

      return true;
    }

    attemptId.current += 1;
    const id = attemptId.current;
    const originalPanels = panelsRef.current;
    const attempt: NavigationAttempt = {
      id,
      loadingTimer: window.setTimeout(() => {
        if (attemptRef.current?.id !== id) return;

        const pending = panelsForSlugs(targetSlugs.slice(0, -1)) ?? originalPanels.slice(0, -1);

        updatePanels([...pending, { phase: 'loading', slug: navigation.targetSlug, status: 'pending' }]);
      }, LOADING_DELAY),
      originalPanels,
      shellTimer: window.setTimeout(() => {
        if (attemptRef.current?.id !== id) return;

        const pending = panelsForSlugs(targetSlugs.slice(0, -1)) ?? originalPanels.slice(0, -1);

        updatePanels([...pending, { phase: 'blank', slug: navigation.targetSlug, status: 'pending' }]);
      }, SHELL_DELAY),
      slugs: targetSlugs,
      targetSlug: navigation.targetSlug,
    };

    attemptRef.current = attempt;
    setNavigationActive(true);

    void cache.load(navigation.targetSlug)
      .then((artifact) => {
        if (attemptRef.current?.id !== id) return;

        const next = panelsForSlugs(targetSlugs, artifact);

        if (!next) throw new Error('failed to compose loaded note stack');

        clearAttempt(attempt);
        commit(next, true);
      })
      .catch(() => {
        if (attemptRef.current?.id !== id) return;

        window.clearTimeout(attempt.shellTimer);
        window.clearTimeout(attempt.loadingTimer);
        updatePanels(originalPanels);
        const fallbackUrl = buildNoteStackUrl(targetSlugs);

        attempt.fallbackTimer = window.setTimeout(() => {
          if (attemptRef.current?.id !== id) return;

          clearAttempt(attempt);
          window.location.assign(fallbackUrl);
        }, 10_000);
        router.push(fallbackUrl);
      });

    return true;
  }, [cache, clearAttempt, commit, loadStack, panelsForSlugs, router, updatePanels]);

  const isNavigationActive = useCallback(() => attemptRef.current !== null, []);

  useEffect(() => {
    const serverSlugs = initialPanels.map((panel) => panel.slug);
    const urlSlugs = parseNoteStackUrl(window.location.pathname, window.location.search);

    if (!sameSlugs(serverSlugs, urlSlugs)) return;

    const attempt = attemptRef.current;

    if (attempt && sameSlugs(attempt.slugs, serverSlugs)) clearAttempt(attempt);
    updatePanels(initialPanels);
  }, [clearAttempt, initialPanels, updatePanels]);

  useEffect(() => {
    const onPopState = () => {
      historyGeneration.current += 1;
      const generation = historyGeneration.current;
      const attempt = attemptRef.current;

      if (attempt) {
        clearAttempt(attempt);
        updatePanels(attempt.originalPanels);
      }

      const slugs = parseNoteStackUrl(window.location.pathname, window.location.search);

      if (slugs.length === 0) return;

      void loadStack(slugs)
        .then((next) => {
          if (historyGeneration.current !== generation) return;

          const current = parseNoteStackUrl(window.location.pathname, window.location.search);

          if (current.join('\0') === slugs.join('\0')) commit(next, false);
        })
        .catch(() => {
          if (historyGeneration.current === generation) window.location.reload();
        });
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      historyGeneration.current += 1;
      window.removeEventListener('popstate', onPopState);

      const attempt = attemptRef.current;

      if (attempt) clearAttempt(attempt, false);
    };
  }, [clearAttempt, commit, loadStack, updatePanels]);

  return {
    isNavigating: navigationActive,
    isNavigationActive,
    navigate,
    panels,
  };
};
