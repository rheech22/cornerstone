import type { ReactNode } from "react";

import { ChevronFirstIcon } from "@/shared/components/icons/chevron-first";
import { XIcon } from "@/shared/components/icons/x";
import { cn } from "@/shared/lib/cn";

import type { StackPanel } from "./build-stack";

type NotePanelProps = {
  slug: string;
  frontmatter: StackPanel["frontmatter"];
  children: ReactNode;
};

export const NotePanel = ({ slug, frontmatter, children }: NotePanelProps) => (
  <section
    data-panel-slug={slug}
    className={cn(
      "note-panel flex h-full w-[560px] shrink-0 flex-col overflow-y-auto tui-scroll border-r border-vague-line",
    )}
  >
    <button
      type="button"
      data-unfold-slug={slug}
      aria-label={`expand ${frontmatter?.title ?? slug}`}
      className={cn("note-panel-spine hidden h-full w-full items-center justify-center px-2 py-3 text-vague-muted")}
    >
      <span className={cn("font-mono text-xs leading-none")}>{frontmatter?.title ?? slug}</span>
    </button>
    <div className={cn("note-panel-body flex min-h-0 flex-1 flex-col")}>
      <header
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-vague-line px-4 py-2",
        )}
      >
        <span className={cn("truncate font-mono text-xs font-medium text-vague-fg")}>{frontmatter?.title ?? slug}</span>
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
      <article className={cn("markdown px-4 py-4")}>{children}</article>
    </div>
  </section>
);
