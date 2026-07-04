import type { ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

import { type ContentItem, type ExternalLink, PAGE_LINKS, type PostGroup, type TagGroup } from './map-data';

export const Section = ({ children, className, title }: { children: ReactNode; className?: string; title: string }) => (
  <section className={cn('border border-vague-line bg-vague-surface/30', className)}>
    <h2 className={cn('border-b border-vague-line px-3 py-2 text-xs uppercase tracking-wider text-vague-muted')}>
      {title}
    </h2>
    <div className={cn('p-3')}>{children}</div>
  </section>
);

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className={cn('border border-vague-line bg-vague-bg px-3 py-2')}>
    <div className={cn('text-lg font-semibold tabular-nums text-vague-fg-bright')}>{value}</div>
    <div className={cn('text-xs uppercase tracking-wider text-vague-muted')}>{label}</div>
  </div>
);

export const OverviewSection = ({
  edgeCount,
  notesCount,
  postsCount,
  tagCount,
}: {
  edgeCount: number;
  notesCount: number;
  postsCount: number;
  tagCount: number;
}) => (
  <Section title="overview">
    <div className={cn('grid gap-2 sm:grid-cols-5')}>
      <Stat label="pages" value={PAGE_LINKS.length} />
      <Stat label="posts" value={postsCount} />
      <Stat label="notes" value={notesCount} />
      <Stat label="tags" value={tagCount} />
      <Stat label="links" value={edgeCount} />
    </div>
  </Section>
);

export const PagesSection = () => (
  <Section title="pages">
    <ul className={cn('flex flex-col gap-2')}>
      {PAGE_LINKS.map((page) => (
        <li key={page.href} className={cn('grid grid-cols-[7rem_1fr] gap-3 text-sm')}>
          <Link href={page.href} className={cn('text-vague-fg hover:text-vague-accent')}>
            {page.label}
          </Link>
          <span className={cn('text-vague-muted')}>{page.desc}</span>
        </li>
      ))}
    </ul>
  </Section>
);

export const ConstellationsSection = ({ groups }: { groups: TagGroup[] }) => (
  <Section title="constellations">
    <ul className={cn('grid gap-2 sm:grid-cols-2')}>
      {groups.map((group) => (
        <li key={group.tag} className={cn('flex items-center justify-between border-b border-vague-line pb-1 text-sm')}>
          <span className={cn('text-vague-fg')}>#{group.tag}</span>
          <span className={cn('text-xs tabular-nums text-vague-muted')}>{group.notes.length}</span>
        </li>
      ))}
    </ul>
  </Section>
);

export const PostsSection = ({ groups }: { groups: PostGroup[] }) => (
  <Section className={cn('lg:col-span-2')} title="posts">
    <div className={cn('flex flex-col gap-5')}>
      {groups.map((group) => (
        <div key={group.year}>
          <h3 className={cn('mb-2 text-xs font-semibold text-vague-muted')}>{group.year}</h3>
          <ul className={cn('flex flex-col gap-1')}>
            {group.posts.map((post) => (
              <li key={post.slug} className={cn('text-sm')}>
                <Link href={`/blog/${post.slug}`} className={cn('truncate text-vague-fg hover:text-vague-accent')}>
                  {post.metadata.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </Section>
);

export const NotesIndexSection = ({ notes }: { notes: ContentItem[] }) => (
  <Section className={cn('lg:col-span-2')} title="notes index">
    <ul className={cn('flex flex-col gap-1')}>
      {notes.map((note) => (
        <li key={note.slug} className={cn('grid min-w-0 gap-2 text-sm sm:grid-cols-[1fr_auto]')}>
          <Link href={`/note/${note.slug}`} className={cn('truncate text-vague-fg hover:text-vague-accent')}>
            {note.metadata.title}
          </Link>
          <span className={cn('flex flex-wrap gap-1 sm:justify-end')}>
            {(note.metadata.tags.length > 0 ? note.metadata.tags : ['untagged']).map((tag) => (
              <span key={tag} className={cn('text-xs text-vague-muted')}>
                #{tag}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  </Section>
);

export const LinksSection = ({ links, totalCount }: { links: ExternalLink[]; totalCount: number }) => (
  <Section className={cn('lg:col-span-2')} title={`links (${links.length}/${totalCount})`}>
    <ul className={cn('flex flex-col gap-1')}>
      {links.map((link) => (
        <li key={`${link.href}-${link.source.slug}`} className={cn('grid min-w-0 gap-2 text-sm lg:grid-cols-[1fr_12rem_12rem]')}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('truncate text-vague-fg hover:text-vague-accent')}
          >
            {link.label}
          </a>
          <span className={cn('truncate text-xs text-vague-muted')}>{link.host}</span>
          <Link
            href={`/${link.source.type}/${link.source.slug}`}
            className={cn('truncate text-xs text-vague-muted hover:text-vague-accent lg:text-right')}
          >
            {link.source.type}/{link.source.slug}
          </Link>
        </li>
      ))}
    </ul>
  </Section>
);
