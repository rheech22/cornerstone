import { getPosts, getSlug } from "@/shared/lib/get-posts";

import { buildStack } from "../_components/build-stack";
import { NotePanel } from "../_components/note-panel";
import { NoteStack } from "../_components/note-stack";

// Static on purpose: stacked `?n=` panels are restored on the client from panel artifacts.
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const panels = await buildStack([slug]);

  return (
    <NoteStack slugs={panels.map((p) => p.slug)}>
      {panels.map(({ backlinks, slug: panelSlug, frontmatter, Post }) => (
        <NotePanel key={panelSlug} backlinks={backlinks} slug={panelSlug} frontmatter={frontmatter}>
          <Post />
        </NotePanel>
      ))}
    </NoteStack>
  );
};

export default Page;

export const generateStaticParams = () => {
  return getPosts("note").map((fileName) => ({
    slug: getSlug(fileName),
  }));
};

export const dynamicParams = false;
