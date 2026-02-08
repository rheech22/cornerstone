import type { CSSProperties } from 'react';
import Link from 'next/link';

import { cn } from '../lib/cn';
import { formatUpdatedAt } from '../lib/date';
import type { Post } from '../lib/layout-types';

interface BaseCardProps {
  post: Post;
  className?: string;
}

type CardSize = 'small' | 'horizontal' | 'vertical' | 'large';

const baseCardClass = cn('flex h-full w-full rounded-[var(--radius-card)] border border-[var(--color-grid-line)]/70');
const interactiveCardClass = cn(
  'group flex h-full w-full min-h-0 flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-grid-line)]/70 px-3 py-2',
  'focus-visible:border-[var(--color-grid-line)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-grid-line)_22%,transparent)]'
);
const titleClass = cn('font-semibold leading-tight tracking-tight text-[var(--color-grid-line)] [overflow-wrap:anywhere]');
const updatedClass = cn('mt-1 max-w-full shrink-0 self-end overflow-hidden text-ellipsis whitespace-nowrap text-right text-[color-mix(in_srgb,var(--color-grid-line)_58%,transparent)]');

const sizeClasses: Record<CardSize, { card?: string; title: string; updated: string }> = {
  small: {
    title: 'text-[0.96rem] overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]',
    updated: 'text-[11px] leading-tight'
  },
  horizontal: {
    title: 'text-[1.05rem] overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]',
    updated: 'text-xs leading-tight'
  },
  vertical: {
    title: 'text-[1.06rem] overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]',
    updated: 'text-xs leading-tight'
  },
  large: {
    title: 'text-[1.16rem] overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]',
    updated: 'text-[13px] leading-tight'
  }
};

function GridCardBase({ post, className = '', size }: BaseCardProps & { size: CardSize }) {
  const updatedLabel = formatUpdatedAt(post.updated, 30);
  const sizeStyle = sizeClasses[size];

  return (
    <Link
      href={`/${post.type}/${post.id}`}
      className={cn(baseCardClass, interactiveCardClass, sizeStyle.card, className)}
    >
      <span className={cn(titleClass, sizeStyle.title)}>{post.title}</span>
      {updatedLabel && <span className={cn(updatedClass, sizeStyle.updated)}>{updatedLabel}</span>}
    </Link>
  );
}

export function GridCardSmall({ post, className = '' }: BaseCardProps) {
  return <GridCardBase post={post} className={className} size="small" />;
}

export function GridCardHorizontal({ post, className = '' }: BaseCardProps) {
  return <GridCardBase post={post} className={className} size="horizontal" />;
}

export function GridCardVertical({ post, className = '' }: BaseCardProps) {
  return <GridCardBase post={post} className={className} size="vertical" />;
}

export function GridCardLarge({ post, className = '' }: BaseCardProps) {
  return <GridCardBase post={post} className={className} size="large" />;
}

export function EmptyCell({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={cn(className)} style={style} />
  );
}
