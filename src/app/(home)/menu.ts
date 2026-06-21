import type { Route } from 'next';

export type MenuEntry =
  | { shortcut: string; label: string; href: Route }
  | { shortcut: string; label: string; action: 'explorer' };

export const MENU: MenuEntry[] = [
  { shortcut: 'a', label: 'about', href: '/about' },
  { shortcut: 'e', label: 'explorer', action: 'explorer' },
  { shortcut: 'p', label: 'posts', href: '/blog' },
  { shortcut: 'n', label: 'notes', href: '/note' },
  { shortcut: 's', label: 'sitemap', href: '/sitemap' },
];
