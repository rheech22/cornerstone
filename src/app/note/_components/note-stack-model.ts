import type { Route } from 'next';

export const NOTE_SPINE_WIDTH = 48;

export type PanelMetric = {
  slug: string;
  offsetLeft: number;
  offsetWidth: number;
};

export type StackAction =
  | { type: 'focus'; slug: string }
  | { type: 'navigate'; slugs: string[] }
  | { type: 'noop' };

export type StackNavigation =
  | { kind: 'append'; slugs: string[]; targetSlug: string }
  | { kind: 'close'; closedSlug: string; slugs: string[]; targetSlug: string };

export const buildNoteStackUrl = (slugs: string[]): Route => {
  const [primary, ...stack] = slugs;
  const params = new URLSearchParams();

  stack.forEach((slug) => params.append('n', slug));

  const path = !primary || primary === 'index' ? '/note' : `/note/${primary}`;
  const query = params.toString();

  return `${path}${query ? `?${query}` : ''}` as Route;
};

export const getStackAction = ({
  fromIndex,
  slugs,
  targetSlug,
}: {
  fromIndex: number;
  slugs: string[];
  targetSlug: string;
}): StackAction => {
  if (fromIndex < 0 || !targetSlug) return { type: 'noop' };

  if (slugs.includes(targetSlug)) return { type: 'focus', slug: targetSlug };

  return { type: 'navigate', slugs: [...slugs.slice(0, fromIndex + 1), targetSlug] };
};

export const getMobileStackSlugs = ({
  slugs,
  targetSlug,
}: {
  slugs: string[];
  targetSlug: string;
}) => {
  const existingIndex = slugs.indexOf(targetSlug);

  if (existingIndex !== -1) return slugs.slice(0, existingIndex + 1);

  return [...slugs, targetSlug];
};

export const getAutoSpineSlugs = ({
  manualFoldedSlugs,
  panels,
  scrollLeft,
  spineWidth = NOTE_SPINE_WIDTH,
}: {
  manualFoldedSlugs: string[];
  panels: PanelMetric[];
  scrollLeft: number;
  spineWidth?: number;
}) => {
  const manualFolded = new Set(manualFoldedSlugs);
  let nextOffset = 0;

  return panels
    .slice(0, -1)
    .filter((panel, index) => {
      const nextPanel = panels[index + 1];

      nextOffset += panel.offsetWidth;

      if (manualFolded.has(panel.slug) || !nextPanel) return false;

      return scrollLeft >= nextOffset - (index + 1) * spineWidth - 1;
    })
    .map((panel) => panel.slug);
};

export const getFocusScrollLeft = ({
  panels,
  targetIndex,
  spineWidth = NOTE_SPINE_WIDTH,
}: {
  panels: PanelMetric[];
  targetIndex: number;
  spineWidth?: number;
}) => {
  if (targetIndex < 0) return 0;

  const railOffset = targetIndex * spineWidth;
  const targetOffset = panels.slice(0, targetIndex).reduce((sum, panel) => sum + panel.offsetWidth, 0);

  return Math.max(0, targetOffset - railOffset);
};

export const sameSlugs = (a: string[], b: string[]) =>
  a.length === b.length && a.every((slug, index) => slug === b[index]);

export const getCurrentStackSlug = (slugs: string[], activeSlug: string) =>
  slugs.includes(activeSlug) ? activeSlug : slugs[slugs.length - 1] ?? '';

export const getNextActiveAfterClose = (slugs: string[], slug: string) => {
  const remaining = slugs.filter((s) => s !== slug);

  if (remaining.length === 0) return '';

  const nextIndex = Math.min(Math.max(slugs.indexOf(slug), 0), remaining.length - 1);

  return remaining[nextIndex] ?? '';
};

export const getWrappedStackSlug = (slugs: string[], activeSlug: string, delta: number) => {
  if (slugs.length === 0) return '';

  const currentSlug = getCurrentStackSlug(slugs, activeSlug);
  const currentIndex = slugs.indexOf(currentSlug);
  const nextIndex = (currentIndex + delta + slugs.length) % slugs.length;

  return slugs[nextIndex] ?? '';
};

export const slugFromNoteHref = (href: string) => {
  const { pathname } = new URL(href, 'http://localhost');

  if (!pathname.startsWith('/note/')) return '';

  return decodeURIComponent(pathname.slice('/note/'.length));
};
