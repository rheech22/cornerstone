'use client';

import { type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode, useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { type PreviewTarget, usePreview } from '@/shared/lib/use-preview';

type WikiPreviewScopeProps = {
  children: ReactNode;
};

type PreviewState = {
  label: string;
  position: { left: number; top: number };
  target: PreviewTarget;
};

const PREVIEW_WIDTH = 360;
const PREVIEW_HEIGHT = 320;
const PREVIEW_GAP = 10;
const VIEWPORT_MARGIN = 12;

const getPreviewPosition = (rect: DOMRect) => {
  const maxLeft = window.innerWidth - PREVIEW_WIDTH - VIEWPORT_MARGIN;
  const below = rect.bottom + PREVIEW_GAP;
  const above = rect.top - PREVIEW_HEIGHT - PREVIEW_GAP;
  const left = Math.min(Math.max(rect.left, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, maxLeft));
  const top = below + PREVIEW_HEIGHT <= window.innerHeight - VIEWPORT_MARGIN ? below : Math.max(VIEWPORT_MARGIN, above);

  return { left, top };
};

const getWikiLink = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return null;

  return target.closest<HTMLAnchorElement>('a.wiki-link');
};

const getPreviewTarget = (link: HTMLAnchorElement): PreviewTarget | null => {
  const type = link.dataset.wikiType === 'blog' ? 'blog' : 'note';
  const slug = link.dataset.wikiSlug;

  if (!slug) return null;

  return { type, slug };
};

export const WikiPreviewScope = ({ children }: WikiPreviewScopeProps) => {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const { html, loading } = usePreview(Boolean(preview), preview?.target ?? null);

  const openPreview = (link: HTMLAnchorElement) => {
    const target = getPreviewTarget(link);

    if (!target) return;

    setPreview({
      label: link.dataset.wikiLabel || link.textContent?.trim() || target.slug,
      position: getPreviewPosition(link.getBoundingClientRect()),
      target,
    });
  };

  const closePreview = () => setPreview(null);

  const handlePointerOver = (event: PointerEvent<HTMLDivElement>) => {
    const link = getWikiLink(event.target);

    if (link) openPreview(link);
  };

  const handlePointerOut = (event: PointerEvent<HTMLDivElement>) => {
    const link = getWikiLink(event.target);
    const relatedTarget = event.relatedTarget;

    if (!link || (relatedTarget instanceof Node && link.contains(relatedTarget))) return;

    closePreview();
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    const link = getWikiLink(event.target);

    if (link) openPreview(link);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const link = getWikiLink(event.target);
    const relatedTarget = event.relatedTarget;

    if (!link || (relatedTarget instanceof Node && link.contains(relatedTarget))) return;

    closePreview();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') closePreview();
  };

  useEffect(() => {
    if (!preview) return;

    const close = () => setPreview(null);

    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);

    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [preview]);

  return (
    <div
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
      onKeyDownCapture={handleKeyDown}
      className={cn('contents')}
    >
      {children}
      {preview && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none fixed z-50 w-[min(22.5rem,calc(100vw-1.5rem))] overflow-hidden rounded-md border border-vague-border bg-vague-surface/95 shadow-2xl backdrop-blur-sm',
          )}
          style={{ left: preview.position.left, top: preview.position.top }}
        >
          <div className={cn('border-b border-vague-line px-3 py-2')}>
            <p className={cn('text-[0.65rem] uppercase tracking-wider text-vague-muted')}>{preview.target.type}</p>
            <p className={cn('mt-0.5 truncate text-sm text-vague-fg-bright')}>{preview.label}</p>
          </div>
          <div className={cn('tui-scroll max-h-72 overflow-y-auto px-3 py-2')}>
            {loading || html === null ? (
              <p className={cn('text-sm text-vague-muted')}>peeking…</p>
            ) : html.length > 0 ? (
              <div className={cn('peek-md')} inert dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className={cn('text-sm text-vague-muted')}>preview unavailable</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
