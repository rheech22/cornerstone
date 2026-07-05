import { cn } from '@/shared/lib/cn';
import { getPostData } from '@/shared/lib/get-posts';

import {
  buildEdges,
  buildExternalLinks,
  buildPostGroups,
  buildTagGroups,
  EXTERNAL_LINK_LIMIT,
  getTopConstellations,
  sortByTitle,
} from './_components/map-data';
import {
  ConstellationsSection,
  LinksSection,
  NotesIndexSection,
  OverviewSection,
  PagesSection,
  PostsSection,
} from './_components/map-sections';

const SitemapPage = () => {
  const posts = getPostData('blog');
  const notes = getPostData('note');
  const edges = buildEdges(notes);
  const tagGroups = buildTagGroups(notes);
  const postGroups = buildPostGroups(posts);
  const externalLinks = buildExternalLinks({ blogs: posts, notes });

  return (
    <main className={cn('min-h-0 flex-1 overflow-y-auto bg-vague-bg text-vague-fg tui-scroll')}>
      <div className={cn('mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6')}>
        <header className={cn('mb-2')}>
          <p className={cn('text-xs uppercase tracking-[0.3em] text-vague-muted')}>~/map</p>
          <h1 className={cn('mt-2 text-2xl font-semibold text-vague-fg-bright')}>textual atlas</h1>
          <p className={cn('mt-2 max-w-2xl text-sm text-vague-muted')}>
            A graph-ready map of pages, posts, notes, and constellations.
          </p>
        </header>

        <OverviewSection edgeCount={edges.length} notesCount={notes.length} postsCount={posts.length} tagCount={tagGroups.length} />

        <div className={cn('grid gap-4 lg:grid-cols-[0.8fr_1.4fr]')}>
          <PagesSection />
          <ConstellationsSection groups={getTopConstellations(tagGroups)} />
          <PostsSection groups={postGroups} />
          <NotesIndexSection notes={sortByTitle(notes)} />
          <LinksSection links={externalLinks.slice(0, EXTERNAL_LINK_LIMIT)} totalCount={externalLinks.length} />
        </div>
      </div>
    </main>
  );
};

export default SitemapPage;
