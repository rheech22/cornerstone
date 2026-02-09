import type { CSSProperties } from 'react';

import { EmptyCell, GridCardHorizontal, GridCardLarge, GridCardSmall, GridCardVertical } from '@/app/components/grid-cards';
import { HomeHeader } from '@/app/components/home-header';
import { cn } from '@/app/lib/cn';
import { getPostData } from '@/app/lib/get-posts';
import { generateLayout } from '@/app/lib/layout-engine';
import type { LayoutResult, Post } from '@/app/lib/layout-types';

import styles from './page.module.css';

interface PageProps {
  searchParams?: Promise<{ seed?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const blogPosts = getPostData('blog').filter(p => p.slug !== 'index');
  const notePosts = getPostData('note').filter(p => p.slug !== 'index');

  const allPosts: Post[] = [
    ...blogPosts.map(p => ({
      id: p.slug,
      title: p.metadata.title || p.slug,
      created: p.metadata.created,
      updated: p.metadata.updated,
      tags: p.metadata.tags || [],
      contentLength: p.content.length,
      type: 'blog' as const
    })),
    ...notePosts.map(p => ({
      id: p.slug,
      title: p.metadata.title || p.slug,
      created: p.metadata.created,
      updated: p.metadata.updated,
      tags: p.metadata.tags || [],
      contentLength: p.content.length,
      type: 'note' as const
    }))
  ];

  const seed = params?.seed ? parseInt(params.seed) : undefined;
  const pinnedPost = pickPinnedPost(allPosts);
  const remainingPosts = pinnedPost
    ? allPosts.filter(post => post.id !== pinnedPost.id)
    : allPosts;
  const shuffledPosts = shufflePosts(remainingPosts, seed);
  const orderedPosts = pinnedPost ? [pinnedPost, ...shuffledPosts] : shuffledPosts;
  const desktopLayout = generateLayout(orderedPosts, seed);
  const mobileLayout = generateLayout(orderedPosts, {
    seed,
    config: {
      gridCols: 4
    }
  });

  if (!desktopLayout && !mobileLayout) {
    return (
      <main className={cn('min-h-dvh flex items-center justify-center p-6')}>
        <div className={cn('text-center text-sm text-neutral-700')}>
          <p>Layout generation failed.</p>
          <p>Posts: {allPosts.length}</p>
        </div>
      </main>
    );
  }

  const postMap = new Map(allPosts.map(p => [p.id, p]));
  const fallbackLayout = desktopLayout ?? mobileLayout;

  if (!fallbackLayout) {
    return null;
  }

  const resolvedDesktopLayout = desktopLayout ?? fallbackLayout;
  const resolvedMobileLayout = mobileLayout ?? fallbackLayout;

  return (
    <main className={cn('min-h-dvh noise-bg p-6')}>
      <HomeHeader />
      <div className={styles.gridWrap}>
        <h1 className={cn('sr-only')}>cornerstone</h1>
        <div className={styles.gridStack}>
          {renderLayoutGrid(resolvedDesktopLayout, postMap, styles.desktopGrid)}
          {renderLayoutGrid(resolvedMobileLayout, postMap, styles.mobileGrid)}
        </div>
      </div>
    </main>
  );
}

function renderLayoutGrid(layout: LayoutResult, postMap: Map<string, Post>, visibilityClassName: string) {
  const gridStyle = {
    gridTemplateColumns: `repeat(${layout.cols}, minmax(0, var(--cell-size)))`,
    ['--grid-cols' as const]: layout.cols
  } as CSSProperties;

  return (
    <div className={cn(styles.grid, visibilityClassName)} style={gridStyle}>
      {layout.placements.map((placement, index) => {
        const post = postMap.get(placement.postId);

        if (!post) return null;

        const style = {
          gridColumn: `${placement.col + 1} / span ${placement.w}`,
          gridRow: `${placement.row + 1} / span ${placement.h}`
        };

        switch (placement.type) {
          case 'S':
            return (
              <div key={`${placement.postId}-${index}`} style={style} className={cn('h-full')}>
                <GridCardSmall post={post} className={cn('h-full')} />
              </div>
            );
          case 'MX':
            return (
              <div key={`${placement.postId}-${index}`} style={style} className={cn('h-full')}>
                <GridCardHorizontal post={post} className={cn('h-full')} />
              </div>
            );
          case 'MY':
            return (
              <div key={`${placement.postId}-${index}`} style={style} className={cn('h-full')}>
                <GridCardVertical post={post} className={cn('h-full')} />
              </div>
            );
          case 'L':
            return (
              <div key={`${placement.postId}-${index}`} style={style} className={cn('h-full')}>
                <GridCardLarge post={post} className={cn('h-full')} />
              </div>
            );
          default:
            return null;
        }
      })}

      {Array.from({ length: layout.rows }).map((_, row) =>
        Array.from({ length: layout.cols }).map((_, col) => {
          const isOccupied = layout.placements.some(p =>
            row >= p.row && row < p.row + p.h &&
            col >= p.col && col < p.col + p.w
          );

          if (isOccupied) return null;

          const style = {
            gridColumn: `${col + 1}`,
            gridRow: `${row + 1}`
          };

          return <EmptyCell key={`empty-${row}-${col}`} className={cn('h-full w-full')} style={style} />;
        })
      )}
    </div>
  );
}

function pickPinnedPost(posts: Post[]): Post | null {
  const bySlug = posts.find(post =>
    ['about', 'intro', 'introducing', 'introduction'].some(key => post.id.includes(key))
  );

  if (bySlug) return bySlug;
  const byTitle = posts.find(post =>
    ['소개', 'intro', 'about', 'introduction'].some(key => post.title.toLowerCase().includes(key))
  );

  if (byTitle) return byTitle;

  return posts.find(post => post.type === 'blog') ?? posts[0] ?? null;
}

function shufflePosts(posts: Post[], seed?: number): Post[] {
  const result = [...posts];
  let state = seed ?? Math.floor(Math.random() * 1000000);
  const random = (): number => {
    state = (state * 9301 + 49297) % 233280;

    return state / 233280;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
