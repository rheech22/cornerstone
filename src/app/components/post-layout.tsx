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
    <div className=" mx-auto px-4 py-6">
      <div className="flex flex-col gap-8 items-center">
        {frontmatter && (
          <div className="w-full mt-10 flex flex-col items-center">
            <h1 className="text-5xl break-words break-all">
              {frontmatter.title}
            </h1>
            <div className="text-black/60 mb-10 text-sm">
              <span>
                published {from(new Date(frontmatter.created))} {" · "} last
                updated {from(new Date(frontmatter.updated))}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {frontmatter.tags.map((tag) => (
                <span key={tag} className="inline-block px-1 mb-1">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <article className="grow markdown">{children}</article>
      </div>
    </div>
  );
};
