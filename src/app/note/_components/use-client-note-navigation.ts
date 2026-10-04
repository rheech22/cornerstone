'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { NOTE_STACK_HISTORY_EVENT } from '@/shared/lib/note-stack-history';

import type { NotePanelArtifact } from './note-panel-artifact';
import type { NotePanelCache } from './note-panel-cache';
import { buildNoteStackUrl, parseNoteStackUrl, sameSlugs, type StackNavigation } from './note-stack-model';

export type ClientNotePanel =
  | { content: ReactNode; slug: string; status: 'server' }
  | { artifact: NotePanelArtifact; slug: string; status: 'artifact' }
  | { phase: 'blank' | 'loading'; slug: string; status: 'pending' };

type HistoryMode = 'none' | 'push' | 'replace';

type LoadTask = {
  id: number;
  timers: number[];
};

type LoadStackOptions = {
  history: HistoryMode;
  // `delayed` keeps the current stack for a moment so fast loads never flash a placeholder.
  reveal: 'delayed' | 'immediate';
  // When set, failing to load this slug falls back to opening it as a server-rendered page.
  targetSlug?: string;
};

type UseClientNoteNavigationArgs = {
  cache: NotePanelCache;
  initialPanels: ClientNotePanel[];
  // Called with the panel to activate when the stack is restored from the URL.
  onRestore?: (slug: string) => void;
};

const SHELL_DELAY = 100;
const LOADING_DELAY = 200;
const FALLBACK_TIMEOUT = 10_000;

const getPanelMap = (panels: ClientNotePanel[]) => new Map<string, ClientNotePanel>(panels.filter((panel) => panel.status !== 'pending').map((panel) => [panel.slug, panel]));

const writeHistory = (mode: HistoryMode, slugs: string[]) => {
  if (mode === 'none') return;

  const url = buildNoteStackUrl(slugs);

  if (mode === 'push') window.history.pushState(null, '', url);
  else window.history.replaceState(window.history.state, '', url);
};

export const useClientNoteNavigation = ({ cache, initialPanels, onRestore }: UseClientNoteNavigationArgs) => {
  const router = useRouter();
  const onRestoreRef = useRef(onRestore);
  const taskId = useRef(0);
  const taskRef = useRef<LoadTask | null>(null);
  const panelsRef = useRef(initialPanels);
  const [busy, setBusy] = useState(false);
  const [panels, setPanels] = useState(initialPanels);

  panelsRef.current = panels;
  onRestoreRef.current = onRestore;

  const updatePanels = useCallback((next: ClientNotePanel[]) => {
    panelsRef.current = next;
    setPanels(next);
    cache.pin(next.filter((panel) => panel.status !== 'pending').map((panel) => panel.slug));
  }, [cache]);

  const finishTask = useCallback((task: LoadTask, updateState = true) => {
    task.timers.forEach((timer) => window.clearTimeout(timer));
    task.timers = [];

    if (taskRef.current?.id === task.id) {
      taskRef.current = null;
      if (updateState) setBusy(false);
    }
  }, []);

  const startTask = useCallback((): LoadTask => {
    if (taskRef.current) finishTask(taskRef.current, false);

    taskId.current += 1;
    const task: LoadTask = { id: taskId.current, timers: [] };

    taskRef.current = task;
    setBusy(true);

    return task;
  }, [finishTask]);

  const resolvePanel = useCallback((slug: string, known: Map<string, ClientNotePanel>): ClientNotePanel | null => {
    const panel = known.get(slug);

    if (panel) return panel;

    const artifact = cache.peek(slug);

    return artifact ? { artifact, slug, status: 'artifact' } : null;
  }, [cache]);

  const loadStack = useCallback((slugs: string[], { history, reveal, targetSlug }: LoadStackOptions) => {
    const known = getPanelMap(panelsRef.current);
    const resolved = slugs.map((slug) => resolvePanel(slug, known));
    const withPending = (phase: 'blank' | 'loading') =>
      slugs.map((slug, index) => resolved[index] ?? { phase, slug, status: 'pending' as const });

    if (resolved.every((panel) => panel !== null)) {
      if (taskRef.current) finishTask(taskRef.current);
      updatePanels(resolved);
      writeHistory(history, slugs);

      return;
    }

    const task = startTask();
    const isCurrent = () => taskRef.current?.id === task.id;

    if (reveal === 'immediate') {
      updatePanels(withPending('loading'));
    } else {
      task.timers.push(
        window.setTimeout(() => isCurrent() && updatePanels(withPending('blank')), SHELL_DELAY),
        window.setTimeout(() => isCurrent() && updatePanels(withPending('loading')), LOADING_DELAY),
      );
    }

    const missing = slugs.filter((_, index) => !resolved[index]);

    void Promise.allSettled(missing.map((slug) => cache.load(slug))).then(() => {
      if (!isCurrent()) return;

      const loaded = new Map([...known, ...getPanelMap(panelsRef.current)]);
      const next = slugs
        .map((slug) => resolvePanel(slug, loaded))
        .filter((panel): panel is ClientNotePanel => panel !== null);
      const targetFailed = Boolean(targetSlug) && !next.some((panel) => panel.slug === targetSlug);

      if (targetFailed || next.length === 0) {
        // Keep the placeholder on screen while the server-rendered page takes over.
        const fallbackUrl = buildNoteStackUrl(targetSlug ? [targetSlug] : slugs);

        task.timers.forEach((timer) => window.clearTimeout(timer));
        task.timers = [window.setTimeout(() => isCurrent() && window.location.assign(fallbackUrl), FALLBACK_TIMEOUT)];
        updatePanels(withPending('loading'));
        router.push(fallbackUrl);

        return;
      }

      finishTask(task);
      updatePanels(next);

      const dropped = next.length !== slugs.length;

      writeHistory(dropped && history === 'none' ? 'replace' : history, next.map((panel) => panel.slug));
    });
  }, [cache, finishTask, resolvePanel, router, startTask, updatePanels]);

  const navigate = useCallback((navigation: StackNavigation): boolean => {
    if (taskRef.current) return false;

    const targetSlugs = navigation.slugs.length > 0 ? navigation.slugs : ['index'];

    if (navigation.kind === 'close') {
      loadStack(targetSlugs, { history: 'push', reveal: 'immediate' });

      return true;
    }

    loadStack(targetSlugs, { history: 'push', reveal: 'delayed', targetSlug: navigation.targetSlug });

    return true;
  }, [loadStack]);

  const isNavigationActive = useCallback(() => taskRef.current !== null, []);

  const restoreFromUrl = useCallback(() => {
    const slugs = parseNoteStackUrl(window.location.pathname, window.location.search);
    const target = slugs[slugs.length - 1];

    if (!target) return;

    const currentSlugs = panelsRef.current.map((panel) => panel.slug);

    if (!sameSlugs(currentSlugs, slugs)) onRestoreRef.current?.(target);
    loadStack(slugs, { history: 'none', reveal: 'immediate' });
  }, [loadStack]);

  // The server renders only the primary note; stacked `?n=` panels are restored on the client.
  useEffect(() => {
    const known = getPanelMap(panelsRef.current);

    initialPanels.forEach((panel) => known.set(panel.slug, panel));
    panelsRef.current = [...known.values()];
    restoreFromUrl();
  }, [initialPanels, restoreFromUrl]);

  useEffect(() => {
    window.addEventListener('popstate', restoreFromUrl);
    window.addEventListener(NOTE_STACK_HISTORY_EVENT, restoreFromUrl);

    return () => {
      window.removeEventListener('popstate', restoreFromUrl);
      window.removeEventListener(NOTE_STACK_HISTORY_EVENT, restoreFromUrl);

      if (taskRef.current) finishTask(taskRef.current, false);
    };
  }, [finishTask, restoreFromUrl]);

  return {
    isNavigating: busy,
    isNavigationActive,
    navigate,
    panels,
  };
};
