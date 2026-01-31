import type { CSSProperties } from 'react';
import Link from 'next/link';

import { cn } from '../lib/cn';
import type { Post } from '../lib/layout-types';

interface BaseCardProps {
  post: Post;
  className?: string;
}

const baseCardClass = cn('flex h-full w-full items-start border border-[#FFFAF6] p-2 text-xs break-all text-ellipsis rounded-xl');
const titleClass = cn('font-medium text-[#FFFAF6] tracking-tight');

export function GridCardSmall({ post, className = '' }: BaseCardProps) {
  return (
    <Link
      href={`/${post.type}/${post.id}`}
      className={cn(baseCardClass, className)}
    >
      <span className={cn(titleClass)}>{post.title}</span>
    </Link>
  );
}

export function GridCardHorizontal({ post, className = '' }: BaseCardProps) {
  return (
    <Link
      href={`/${post.type}/${post.id}`}
      className={cn(baseCardClass,  className)}
    >
      <span className={cn(titleClass)}>{post.title}</span>
    </Link>
  );
}

export function GridCardVertical({ post, className = '' }: BaseCardProps) {
  return (
    <Link
      href={`/${post.type}/${post.id}`}
      className={cn(baseCardClass, className)}
    >
      <span className={cn(titleClass)}>{post.title}</span>
    </Link>
  );
}

export function GridCardLarge({ post, className = '' }: BaseCardProps) {
  return (
    <Link
      href={`/${post.type}/${post.id}`}
      className={cn(baseCardClass,   className)}
    >
      <span className={cn(titleClass)}>{post.title}</span>
    </Link>
  );
}

export function EmptyCell({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={cn(className)} style={style} />
  );
}
