import type { Metadata } from "next";

import { buildStack } from "./_components/build-stack";
import { NotePanel } from "./_components/note-panel";
import { NoteStack } from "./_components/note-stack";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// Static on purpose: stacked `?n=` panels are restored on the client from panel artifacts.
const Page = async () => {
  const panels = await buildStack(['index']);

  return (
    <NoteStack slugs={panels.map((p) => p.slug)}>
      {panels.map(({ backlinks, slug, frontmatter, Post }) => (
        <NotePanel key={slug} backlinks={backlinks} slug={slug} frontmatter={frontmatter}>
          <Post />
        </NotePanel>
      ))}
    </NoteStack>
  );
};

export default Page;
