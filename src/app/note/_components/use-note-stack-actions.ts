'use client';

import type { Dispatch, SetStateAction } from 'react';

import {
  getCurrentStackSlug,
  getNextActiveAfterClose,
  getStackAction,
  getWrappedStackSlug,
  type StackNavigation,
} from './note-stack-model';

type UseNoteStackActionsArgs = {
  onNavigate: (navigation: StackNavigation) => void;
  panel: {
    activate: (slug: string) => void;
    requestFocus: (slug: string) => void;
    scroll: (slug: string, direction: number) => void;
    setManualFoldedSlugs: Dispatch<SetStateAction<string[]>>;
  };
  stack: {
    activeSlug: string;
    autoSpineSlugs: string[];
    manualFoldedSlugs: string[];
    slugs: string[];
  };
};

export const useNoteStackActions = ({
  onNavigate,
  panel: { activate, requestFocus, scroll, setManualFoldedSlugs },
  stack: { activeSlug, autoSpineSlugs, manualFoldedSlugs, slugs },
}: UseNoteStackActionsArgs) => {
  const unfoldPanel = (slug: string) => {
    setManualFoldedSlugs((current) => (current.includes(slug) ? current.filter((s) => s !== slug) : current));
  };

  const focusExistingPanel = (slug: string) => {
    activate(slug);
    unfoldPanel(slug);
    requestFocus(slug);
  };

  const pushToStack = (fromIndex: number, targetSlug: string) => {
    const action = getStackAction({ fromIndex, slugs, targetSlug });

    if (action.type === 'focus') {
      focusExistingPanel(action.slug);

      return;
    }

    if (action.type === 'navigate') {
      onNavigate({ kind: 'append', slugs: action.slugs, targetSlug });
    }
  };

  const closePanel = (slug: string, nextActiveSlug = '') => {
    const remaining = slugs.filter((s) => s !== slug);

    if (remaining.length === 0) {
      onNavigate({ closedSlug: slug, kind: 'close', slugs: [], targetSlug: '' });

      return;
    }

    onNavigate({ closedSlug: slug, kind: 'close', slugs: remaining, targetSlug: nextActiveSlug });
  };

  const closeAndActivatePanel = (slug: string) => {
    const nextSlug = getNextActiveAfterClose(slugs, slug);

    if (nextSlug) activate(nextSlug);

    closePanel(slug, nextSlug);
  };

  const moveActivePanel = (delta: number) => {
    const nextSlug = getWrappedStackSlug(slugs, activeSlug, delta);

    if (nextSlug) focusExistingPanel(nextSlug);
  };

  const closeActivePanel = () => {
    const slug = getCurrentStackSlug(slugs, activeSlug);

    if (slug) closeAndActivatePanel(slug);
  };

  const scrollActivePanel = (direction: number) => {
    const slug = getCurrentStackSlug(slugs, activeSlug);

    if (slug) scroll(slug, direction);
  };

  const foldPanel = (slug: string) => {
    activate(slug);
    setManualFoldedSlugs((current) => (current.includes(slug) ? current : [...current, slug]));
  };

  const toggleActiveFold = () => {
    const slug = getCurrentStackSlug(slugs, activeSlug);

    if (!slug) return;

    activate(slug);

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
