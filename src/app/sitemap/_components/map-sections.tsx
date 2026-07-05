import type { ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';

import { type ContentItem, type ExternalLink, PAGE_LINKS, type PostGroup, type TagGroup } from './map-data';

export const Section = ({ children, className, title }: { children: ReactNode; className?: string; title: string }) => (
  <section className={cn('min-w-0 border-t border-vague-line/70', className)}>
    <h2 className={cn('py-2 text-xs uppercase tracking-wider text-vague-muted/70')}>
      {title}
    </h2>
    <div className={cn('border-t border-vague-line/70')}>{children}</div>
  </section>
);

const ROW_CLASS_NAME =
  'group/row grid min-w-0 items-baseline border-b border-vague-line/70 py-2.5 text-sm';

const PRIMARY_CLASS_NAME =
  'min-w-0 truncate text-vague-fg transition-colors duration-200 group-hover/list:text-vague-muted/35 group-hover/row:text-vague-fg-bright';

const META_CLASS_NAME = 'min-w-0 truncate text-vague-muted/70';

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className={cn('grid items-baseline gap-2 border-b border-vague-line/70 py-2.5 sm:grid-cols-1')}>
    <div className={cn('text-lg font-semibold tabular-nums text-vague-fg')}>{value}</div>
    <div className={cn('text-xs uppercase tracking-wider text-vague-muted/70')}>{label}</div>
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
    <div className={cn('grid sm:grid-cols-5 sm:gap-x-4')}>
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
    <ul className={cn('group/list')}>
      {PAGE_LINKS.map((page) => (
        <li key={page.href} className={cn(ROW_CLASS_NAME, 'grid-cols-[7rem_minmax(0,1fr)] gap-3')}>
          <Link href={page.href} className={cn(PRIMARY_CLASS_NAME)}>
            {page.label}
          </Link>
          <span className={cn(META_CLASS_NAME)}>{page.desc}</span>
        </li>
      ))}
    </ul>
  </Section>
);

export const ConstellationsSection = ({ groups }: { groups: TagGroup[] }) => (
  <Section title="constellations">
    <ul className={cn('group/list grid sm:grid-cols-2 sm:gap-x-4')}>
      {groups.map((group) => (
        <li key={group.tag} className={cn(ROW_CLASS_NAME, 'grid-cols-[minmax(0,1fr)_auto] gap-3')}>
          <span className={cn(PRIMARY_CLASS_NAME)}>#{group.tag}</span>
          <span className={cn('text-xs tabular-nums text-vague-muted/70')}>{group.notes.length}</span>
        </li>
      ))}
    </ul>
  </Section>
);

export const PostsSection = ({ groups }: { groups: PostGroup[] }) => (
  <Section className={cn('lg:col-span-2')} title="posts">
    <div className={cn('group/list flex flex-col')}>
      {groups.map((group) => (
        <div key={group.year} className={cn('grid min-w-0 sm:grid-cols-[5rem_minmax(0,1fr)]')}>
          <h3 className={cn('border-b border-vague-line/70 py-2.5 text-xs font-semibold text-vague-muted/70')}>
            {group.year}
          </h3>
          <ul className={cn('min-w-0')}>
            {group.posts.map((post) => (
              <li key={post.slug} className={cn(ROW_CLASS_NAME, 'grid-cols-1')}>
                <Link href={`/blog/${post.slug}`} className={cn(PRIMARY_CLASS_NAME)}>
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
    <ul className={cn('group/list')}>
      {notes.map((note) => (
        <li key={note.slug} className={cn(ROW_CLASS_NAME, 'gap-2 sm:grid-cols-[minmax(0,1fr)_auto]')}>
          <Link href={`/note/${note.slug}`} className={cn(PRIMARY_CLASS_NAME)}>
            {note.metadata.title}
          </Link>
          <span className={cn('flex flex-wrap gap-1 sm:justify-end')}>
            {(note.metadata.tags.length > 0 ? note.metadata.tags : ['untagged']).map((tag) => (
              <span key={tag} className={cn('text-xs text-vague-muted/70')}>
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
    <ul className={cn('group/list')}>
      {links.map((link) => (
        <li
          key={`${link.href}-${link.source.slug}`}
          className={cn(ROW_CLASS_NAME, 'gap-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]')}
        >
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(PRIMARY_CLASS_NAME)}
          >
            {link.label}
          </a>
          <span className={cn('truncate text-xs text-vague-muted/70')}>{link.host}</span>
          <Link
            href={`/${link.source.type}/${link.source.slug}`}
            className={cn('truncate text-xs text-vague-muted/70 hover:text-vague-fg-bright lg:text-right')}
          >
            {link.source.type}/{link.source.slug}
          </Link>
        </li>
      ))}
    </ul>
  </Section>
);
