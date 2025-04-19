import { getExcerpt, getPostData } from "../lib/get-posts";
import { SquareLink } from "../components/square-link";
import { highlightMarkdown } from "../lib/highlight-code";

const Notes = async () => {
  const data = getPostData("note");

  return (
    <div className="flex flex-col">
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5 xl:gap-5 2xl:grid-cols-6">
        {data.map(async ({ slug, metadata: { title }, content }) => {
          const exceprt = await highlightMarkdown(getExcerpt(content));
          return (
            <SquareLink
              key={slug}
              title={title}
              href={`/note/${slug}`}
              excerpt={exceprt}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default Notes;
