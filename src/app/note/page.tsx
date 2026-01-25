import { getExcerpt, getPostData } from "../lib/get-posts";
import { highlightMarkdown } from "../lib/highlight-code";
import { NoteList } from "./note-list";

const Notes = async () => {
  const data = getPostData("note");

  const processedNotes = await Promise.all(
    data.map(async ({ slug, metadata: { title }, content }) => {
      const excerpt = await highlightMarkdown(getExcerpt(content));

      return { slug, title, excerpt };
    }),
  );

  return (
    <div className="flex flex-col">
      <NoteList notes={processedNotes} />
    </div>
  );
};

export default Notes;
