import { cn } from "../lib/cn";

type Frontmatter = {
  created: string;
  updated: string;
  title: string;
  tags: string[];
};

type Props = {
  children: React.ReactNode;
  frontmatter?: Frontmatter;
};

const panelClass = cn("border-4 border-black p-4");
const metaItemClass = cn("border-2 border-black p-2");
const metaLabelClass = cn("font-mono text-xs font-bold");

export const NoteLayout = ({ children, frontmatter }: Props) => {
  return (
    <div className={cn("mx-auto max-w-(--breakpoint-xl) px-4 py-6 sm:px-6 lg:px-8")}>
      {/* Mobile */}
      <div className={cn("lg:hidden")}>
        {frontmatter && (
          <div className={cn(panelClass, "mb-6")}>
            <h1 className={cn("mb-4 break-words font-mono text-3xl font-bold")}>
              {frontmatter.title}
            </h1>
            <div className={cn("mb-4 grid grid-cols-2 gap-4")}>
              <div className={cn(metaItemClass)}>
                <div className={cn(metaLabelClass)}>CREATED</div>
                <div>
                  {new Date(frontmatter.created).toLocaleString("ko-KR")}
                </div>
              </div>
              <div className={cn(metaItemClass)}>
                <div className={cn(metaLabelClass)}>UPDATED</div>
                <div>
                  {new Date(frontmatter.updated).toLocaleString("ko-KR")}
                </div>
              </div>
            </div>
            <div className={cn(metaItemClass)}>
              <div className={cn(metaLabelClass, "mb-1")}>TAGS</div>
              <div className={cn("flex flex-wrap gap-1")}>
                {frontmatter.tags.map((tag) => (
                  <span key={tag} className={cn("border border-black px-1")}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <article className={cn("markdown border-4 border-black p-4")}>
          {children}
        </article>
      </div>
      {/* Desktop */}
      <div className={cn("hidden lg:flex lg:gap-8")}>
        {frontmatter && (
          <div className={cn("w-80 shrink-0")}>
            <div className={cn("sticky top-6", panelClass)}>
              <h1 className={cn("mb-6 break-words font-mono text-3xl font-bold")}>
                {frontmatter.title}
              </h1>
              <div className={cn("space-y-4")}>
                <div className={cn(metaItemClass)}>
                  <div className={cn(metaLabelClass)}>CREATED</div>
                  <div>
                    {new Date(frontmatter.created).toLocaleString("ko-KR")}
                  </div>
                </div>

                <div className={cn(metaItemClass)}>
                  <div className={cn(metaLabelClass)}>UPDATED</div>
                  <div>
                    {new Date(frontmatter.updated).toLocaleString("ko-KR")}
                  </div>
                </div>

                <div className={cn(metaItemClass)}>
                  <div className={cn(metaLabelClass, "mb-2")}>TAGS</div>
                  <div className={cn("flex flex-wrap gap-1")}>
                    {frontmatter.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn("mb-1 inline-block border border-black px-1")}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <article className={cn("markdown grow border-4 border-black p-8")}>
          {children}
        </article>
      </div>
    </div>
  );
};
