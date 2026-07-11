import { Backlinks } from '@/shared/components/backlinks';
import { WikiPreviewScope } from '@/shared/components/wiki-preview/wiki-preview-scope';
import type { Backlink } from '@/shared/lib/backlinks';
import { cn } from '@/shared/lib/cn';
import { from } from '@/shared/lib/date';

type Frontmatter = {
  created: string;
  updated: string;
  title: string;
  tags: string[];
};

type Props = {
  children: React.ReactNode;
  backlinks?: Backlink[];
  frontmatter?: Frontmatter;
};

export const PostLayout = ({ children, backlinks = [], frontmatter }: Props) => {
  return (
    <div className={cn('mx-auto w-full min-w-0 px-[1.125em] py-[.3em]')}>
      <div className={cn('flex w-full min-w-0 flex-col items-center gap-8')}>
        {frontmatter && (
          <div className={cn('relative mt-10 flex w-full flex-col items-center pb-4')}>
            <h1 className={cn('mb-10 break-all break-words text-center text-[2.2em] text-vague-fg-bright')}>
              {frontmatter.title}
            </h1>
            <div className={cn('mb-4 flex flex-wrap gap-1 text-vague-muted')}>
              {frontmatter.tags.map((tag) => (
                <span key={tag} className={cn('mb-1 inline-block px-1')}>
                  #{tag}
                </span>
              ))}
            </div>
            <div className={cn('flex items-center justify-center')}>
              <span className={cn('text-lg text-vague-muted/50 lg:text-xl')}>• • •</span>
            </div>
          </div>
        )}
        <WikiPreviewScope>
          <article className={cn('markdown blog-post-markdown grow min-w-0')}>
            {children}
            <Backlinks backlinks={backlinks} />
          </article>
        </WikiPreviewScope>
        {frontmatter && (
          <div className={cn('mx-auto mb-2 text-sm text-vague-muted')}>
            <span>
              published {from(new Date(frontmatter.created))} {' · '} last
              updated {from(new Date(frontmatter.updated))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
