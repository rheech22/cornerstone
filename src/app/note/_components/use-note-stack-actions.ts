'use client';

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { startTransition } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import {
  buildNoteStackUrl,
  getCurrentStackSlug,
  getNextActiveAfterClose,
  getStackAction,
  getWrappedStackSlug,
} from './note-stack-model';

type UseNoteStackActionsArgs = {
  activatePanel: (slug: string) => void;
  activeSlugRef: MutableRefObject<string>;
  autoSpineSlugs: string[];
  focusPanel: (slug: string) => void;
  manualFoldedSlugs: string[];
  onCloseStart: (slug: string) => void;
  onNavigate: (slugs: string[], targetSlug: string) => void;
  scrollPanel: (slug: string, direction: number) => void;
  setManualFoldedSlugs: Dispatch<SetStateAction<string[]>>;
  setPendingActiveSlug: (slug: string) => void;
  slugs: string[];
};

export const useNoteStackActions = ({
  activatePanel,
  activeSlugRef,
  autoSpineSlugs,
  focusPanel,
  manualFoldedSlugs,
  onCloseStart,
  onNavigate,
  scrollPanel,
  setManualFoldedSlugs,
  setPendingActiveSlug,
  slugs,
}: UseNoteStackActionsArgs) => {
  const router = useRouter();

  const unfoldPanel = (slug: string) => {
    setManualFoldedSlugs((current) => current.filter((s) => s !== slug));
  };

  const focusExistingPanel = (slug: string) => {
    activatePanel(slug);
    unfoldPanel(slug);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => focusPanel(slug));
    });
  };

  const pushToStack = (fromIndex: number, targetSlug: string) => {
    const action = getStackAction({ fromIndex, slugs, targetSlug });

    if (action.type === 'focus') {
      focusExistingPanel(action.slug);

      return;
    }

    if (action.type === 'navigate') {
      onNavigate(action.slugs, targetSlug);
    }
  };

  const closePanel = (slug: string, nextActiveSlug = '') => {
    const remaining = slugs.filter((s) => s !== slug);

    if (remaining.length === 0) {
      onCloseStart(slug);
      startTransition(() => router.push('/note' as Route));

      return;
    }

    setPendingActiveSlug(nextActiveSlug);
    onCloseStart(slug);
    startTransition(() => router.push(buildNoteStackUrl(remaining)));
  };

  const closeAndActivatePanel = (slug: string) => {
    const nextSlug = getNextActiveAfterClose(slugs, slug);

    if (nextSlug) activatePanel(nextSlug);

    closePanel(slug, nextSlug);
  };

  const moveActivePanel = (delta: number) => {
    const nextSlug = getWrappedStackSlug(slugs, activeSlugRef.current, delta);

    if (nextSlug) focusExistingPanel(nextSlug);
  };

  const closeActivePanel = () => {
    const slug = getCurrentStackSlug(slugs, activeSlugRef.current);

    if (slug) closeAndActivatePanel(slug);
  };

  const scrollActivePanel = (direction: number) => {
    const slug = getCurrentStackSlug(slugs, activeSlugRef.current);

    if (slug) scrollPanel(slug, direction);
  };

  const foldPanel = (slug: string) => {
    activatePanel(slug);
    setManualFoldedSlugs((current) => (current.includes(slug) ? current : [...current, slug]));
  };

  const toggleActiveFold = () => {
    const slug = getCurrentStackSlug(slugs, activeSlugRef.current);

    if (!slug) return;

    activatePanel(slug);

    if (manualFoldedSlugs.includes(slug) || autoSpineSlugs.includes(slug)) {
      focusExistingPanel(slug);

      return;
    }

    foldPanel(slug);
  };

  return {
    closeActivePanel,
    closeAndActivatePanel,
    closePanel,
    focusExistingPanel,
    foldPanel,
    moveActivePanel,
    pushToStack,
    scrollActivePanel,
    toggleActiveFold,
  };
};
