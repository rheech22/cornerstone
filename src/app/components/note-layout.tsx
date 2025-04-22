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

export const NoteLayout = ({ children, frontmatter }: Props) => {
  return (
    <div className="max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Mobile */}
      <div className="lg:hidden">
        {frontmatter && (
          <div className="border-4 border-black p-4 mb-6">
            <h1 className="font-mono text-3xl font-bold mb-4 break-words">
              {frontmatter.title}
            </h1>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border-2 border-black p-2">
                <div className="font-mono text-xs font-bold">CREATED</div>
                <div>
                  {new Date(frontmatter.created).toLocaleString("ko-KR")}
                </div>
              </div>
              <div className="border-2 border-black p-2">
                <div className="font-mono text-xs font-bold">UPDATED</div>
                <div>
                  {new Date(frontmatter.updated).toLocaleString("ko-KR")}
                </div>
              </div>
            </div>
            <div className="border-2 border-black p-2">
              <div className="font-mono text-xs font-bold mb-1">TAGS</div>
              <div className="flex flex-wrap gap-1">
                {frontmatter.tags.map((tag) => (
                  <span key={tag} className="border border-black px-1">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <article className="border-4 border-black p-4 markdown">
          {children}
        </article>
      </div>
      {/* Desktop */}
      <div className="hidden lg:flex lg:gap-8">
        {frontmatter && (
          <div className="w-80 shrink-0">
            <div className="sticky top-6 border-4 border-black p-4">
              <h1 className="font-mono text-3xl font-bold mb-6 break-words">
                {frontmatter.title}
              </h1>
              <div className="space-y-4">
                <div className="border-2 border-black p-2">
                  <div className="font-mono text-xs font-bold">CREATED</div>
                  <div>
                    {new Date(frontmatter.created).toLocaleString("ko-KR")}
                  </div>
                </div>

                <div className="border-2 border-black p-2">
                  <div className="font-mono text-xs font-bold">UPDATED</div>
                  <div>
                    {new Date(frontmatter.updated).toLocaleString("ko-KR")}
                  </div>
                </div>

                <div className="border-2 border-black p-2">
                  <div className="font-mono text-xs font-bold mb-2">TAGS</div>
                  <div className="flex flex-wrap gap-1">
                    {frontmatter.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block border border-black px-1 mb-1"
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
        <article className="grow border-4 border-black p-8 markdown">
          {children}
        </article>
      </div>
    </div>
  );
};
