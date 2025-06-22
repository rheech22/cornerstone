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
    <div className="mx-auto px-[1.125em] py-[.3em]">
      <div className="flex flex-col gap-8 items-center">
        {frontmatter && (
          <div className="w-full mt-10 flex flex-col items-center pb-4 relative">
            <h1 className="text-[2.2em] break-words break-all mb-10">
              {frontmatter.title}
            </h1>
            <div className="flex flex-wrap gap-1 mb-4">
              {frontmatter.tags.map((tag) => (
                <span key={tag} className="inline-block px-1 mb-1">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex justify-center items-center">
              <span className="text-black/30 text-lg lg:text-xl">• • •</span>
            </div>
          </div>
        )}
        <article className="grow markdown">{children}</article>
        {frontmatter && (
          <div className="text-black/60 text-sm mx-auto mb-2">
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
