import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NotePanel } from '@/app/note/_components/note-panel';
import { NOTE_PANEL_ARTIFACT_VERSION } from '@/app/note/_components/note-panel-artifact';
import { getNoteSlugs, loadNotePanel } from '@/shared/lib/note-panel';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
};

export const dynamicParams = false;

export const generateStaticParams = () => getNoteSlugs().map((slug) => ({ slug }));

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const panel = await loadNotePanel(slug);

  if (!panel) notFound();

  const { backlinks, frontmatter, Post } = panel;

  return (
    <div data-note-panel-artifact="1" data-panel-slug={slug} data-artifact-version={NOTE_PANEL_ARTIFACT_VERSION}>
      <NotePanel backlinks={backlinks} slug={slug} frontmatter={frontmatter}>
        <Post />
      </NotePanel>
    </div>
  );
};

export default Page;
