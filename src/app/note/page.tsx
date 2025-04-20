export const dynamic = "force-dynamic";

import { getExcerpt, getPostData } from "../lib/get-posts";
import { SquareLink } from "../components/square-link";
import { highlightMarkdown } from "../lib/highlight-code";
import { shuffle } from "../lib/array";
import { StaggerGridList } from "../components/stagger-grid-list";

const Notes = async () => {
  const data = getPostData("note");

  return (
    <div className="flex flex-col">
      <StaggerGridList count={data.length}>
        {shuffle(data).map(async ({ slug, metadata: { title }, content }) => {
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
      </StaggerGridList>
    </div>
  );
};

export default Notes;
