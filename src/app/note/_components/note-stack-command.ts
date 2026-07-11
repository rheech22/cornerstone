import { slugFromNoteHref } from './note-stack-model';

export type NotePanelCommand =
  | { type: 'activate'; slug: string }
  | { type: 'close'; panelSlug: string; slug: string }
  | { type: 'fold'; panelSlug: string; slug: string }
  | { type: 'open'; panelSlug: string; targetSlug: string }
  | { type: 'unfold'; panelSlug: string; slug: string }
  | { type: 'none' };

export const getNotePanelCommand = (target: HTMLElement): NotePanelCommand => {
  const panelSlug = target.closest<HTMLElement>('[data-panel-slug]')?.dataset.panelSlug ?? '';
  const link = target.closest<HTMLAnchorElement>('a.wiki-link');

  if (link) {
    const targetSlug = slugFromNoteHref(link.getAttribute('href') ?? '');

    return targetSlug ? { panelSlug, targetSlug, type: 'open' } : { type: 'none' };
  }

  const foldSlug = target.closest<HTMLElement>('[data-fold-slug]')?.dataset.foldSlug;

  if (foldSlug) return { panelSlug, slug: foldSlug, type: 'fold' };

  const unfoldSlug = target.closest<HTMLElement>('[data-unfold-slug]')?.dataset.unfoldSlug;

  if (unfoldSlug) return { panelSlug, slug: unfoldSlug, type: 'unfold' };

  const closeSlug = target.closest<HTMLElement>('[data-close-slug]')?.dataset.closeSlug;

  if (closeSlug) return { panelSlug, slug: closeSlug, type: 'close' };

  return panelSlug ? { slug: panelSlug, type: 'activate' } : { type: 'none' };
};
