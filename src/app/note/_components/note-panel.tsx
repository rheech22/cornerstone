import type { ReactNode } from "react";

import { Backlinks } from "@/shared/components/backlinks";
import { ChevronFirstIcon } from "@/shared/components/icons/chevron-first";
import { XIcon } from "@/shared/components/icons/x";
import { WikiPreviewScope } from "@/shared/components/wiki-preview/wiki-preview-scope";
import { cn } from "@/shared/lib/cn";

import type { StackPanel } from "./build-stack";

type NotePanelProps = {
  backlinks: StackPanel["backlinks"];
  slug: string;
  frontmatter: StackPanel["frontmatter"];
  children: ReactNode;
};

export const NotePanel = ({ backlinks, slug, frontmatter, children }: NotePanelProps) => (
  <section
    data-panel-slug={slug}
    tabIndex={-1}
    className={cn(
      "note-panel flex h-full w-[560px] shrink-0 flex-col overflow-hidden border-r border-vague-line",
    )}
  >
    <button
      type="button"
      data-unfold-slug={slug}
      aria-label={`expand ${frontmatter?.title ?? slug}`}
      className={cn("note-panel-spine hidden h-full w-full items-center justify-center px-2 py-3 text-vague-muted")}
    >
      <span className={cn("text-xs leading-none")}>{frontmatter?.title ?? slug}</span>
    </button>
    <div className={cn("note-panel-body flex min-h-0 flex-1 flex-col")}>
      <header
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-vague-line px-4 py-2",
        )}
      >
        <span className={cn("truncate text-xs font-medium text-vague-fg")}>{frontmatter?.title ?? slug}</span>
        <div className={cn("flex items-center gap-1")}>
          <button
            type="button"
            data-fold-slug={slug}
            aria-label={`collapse ${slug}`}
            className={cn("inline-flex size-5 items-center justify-center text-vague-muted hover:text-vague-fg")}
          >
            <ChevronFirstIcon aria-hidden="true" className={cn("flex size-full items-center justify-center")} size={14} />
          </button>
          <button
            type="button"
            data-close-slug={slug}
            aria-label={`close ${slug}`}
            className={cn("inline-flex size-5 items-center justify-center text-vague-muted hover:text-vague-fg")}
          >
            <XIcon aria-hidden="true" className={cn("flex size-full items-center justify-center")} size={14} />
          </button>
        </div>
      </header>
      <WikiPreviewScope>
        <article data-note-scroll="true" className={cn("markdown min-h-0 flex-1 overflow-y-auto px-4 py-4 tui-scroll")}>
          {children}
          <Backlinks backlinks={backlinks} compact />
        </article>
      </WikiPreviewScope>
    </div>
  </section>
);
