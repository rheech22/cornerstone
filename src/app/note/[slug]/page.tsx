import { getPosts, getSlug } from "@/shared/lib/get-posts";

import { buildStack } from "../_components/build-stack";
import { NotePanel } from "../_components/note-panel";
import { NoteStack } from "../_components/note-stack";

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { slug } = await params;
  const { n } = await searchParams;
  const stackedSlugs = Array.isArray(n) ? n : n ? [n] : [];
  const slugs = [slug, ...stackedSlugs];
  const panels = await buildStack(slugs);

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
