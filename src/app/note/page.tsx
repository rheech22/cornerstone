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

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { n } = await searchParams;
  const stackedSlugs = Array.isArray(n) ? n : n ? [n] : [];
  const slugs = ['index', ...stackedSlugs];
  const panels = await buildStack(slugs);

  return (
    <NoteStack slugs={panels.map((p) => p.slug)}>
      {panels.map(({ slug, frontmatter, Post }) => (
        <NotePanel key={slug} slug={slug} frontmatter={frontmatter}>
          <Post />
        </NotePanel>
      ))}
    </NoteStack>
  );
};

export default Page;
