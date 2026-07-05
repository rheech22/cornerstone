import type { Backlink } from '@/shared/lib/backlinks';
import { cn } from '@/shared/lib/cn';

type BacklinksProps = {
  backlinks: Backlink[];
  compact?: boolean;
};

export const Backlinks = ({ backlinks, compact = false }: BacklinksProps) => {
  if (backlinks.length === 0) return null;

  const content = (
    <div className={cn('space-y-2')}>
      {backlinks.map((backlink) => (
        <a
          key={`${backlink.sourceType}/${backlink.sourceSlug}`}
          href={`/${backlink.sourceType}/${backlink.sourceSlug}`}
          className={cn(
            'wiki-link group/backlink block border-l border-vague-line pl-3 !font-normal !no-underline transition-colors hover:border-vague-muted focus:border-vague-muted focus:outline-none',
          )}
          data-wiki-type={backlink.sourceType}
          data-wiki-slug={backlink.sourceSlug}
          data-wiki-label={backlink.sourceTitle}
        >
          <span className={cn('flex items-baseline justify-between gap-3')}>
            <span className={cn('min-w-0 truncate text-sm font-medium text-vague-fg group-hover/backlink:text-vague-fg-bright')}>
              {backlink.sourceTitle}
            </span>
            <span className={cn('shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-vague-muted')}>
              {backlink.sourceType}
            </span>
          </span>
          {backlink.excerpt && (
            <span className={cn('mt-1 block text-xs leading-relaxed text-vague-muted')}>{backlink.excerpt}</span>
          )}
        </a>
      ))}
    </div>
  );

  return (
    <section data-backlinks="true" className={cn('mt-12 border-t border-vague-line pt-4 text-left', compact && 'mt-8 pt-3')}>
      {compact && backlinks.length > 2 ? (
        <details className={cn('group/backlinks')}>
          <summary className={cn('cursor-pointer list-none text-xs uppercase tracking-[0.22em] text-vague-muted')}>
            Backlinks {backlinks.length}
          </summary>
          <div className={cn('mt-3')}>{content}</div>
        </details>
      ) : (
        <>
          <div className={cn('mb-3 text-xs uppercase tracking-[0.22em] text-vague-muted')}>Backlinks {backlinks.length}</div>
          {content}
        </>
      )}
    </section>
  );
};
