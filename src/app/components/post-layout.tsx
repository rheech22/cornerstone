import { cn } from "../lib/cn";
import { from } from "../lib/date";

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

export const PostLayout = ({ children, frontmatter }: Props) => {
  return (
    <div className={cn("mx-auto px-[1.125em] py-[.3em]")}>
      <div className={cn("flex flex-col items-center gap-8")}>
        {frontmatter && (
          <div className={cn("relative mt-10 flex w-full flex-col items-center pb-4")}>
            <h1 className={cn("mb-10 break-all break-words text-center text-[2.2em]")}>
              {frontmatter.title}
            </h1>
            <div className={cn("mb-4 flex flex-wrap gap-1")}>
              {frontmatter.tags.map((tag) => (
                <span key={tag} className={cn("mb-1 inline-block px-1")}>
                  #{tag}
                </span>
              ))}
            </div>
            <div className={cn("flex items-center justify-center")}>
              <span className={cn("text-lg text-black/30 lg:text-xl")}>• • •</span>
            </div>
          </div>
        )}
        <article className={cn("markdown grow")}>{children}</article>
        {frontmatter && (
          <div className={cn("mx-auto mb-2 text-sm text-black/60")}>
            <span>
              published {from(new Date(frontmatter.created))} {" · "} last
              updated {from(new Date(frontmatter.updated))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
