export type ShortcutHint = {
  keys: string[];
  label: string;
};

export type RouteChrome = {
  id: 'home' | 'about' | 'blog' | 'blogPost' | 'note' | 'sitemap' | 'default';
  label: string;
  shortcuts: ShortcutHint[];
};

export const GLOBAL_SHORTCUTS: ShortcutHint[] = [
  { keys: ['c'], label: 'cabinet' },
  { keys: ['?'], label: 'help' },
];

const ROUTES: Array<RouteChrome & { match: (pathname: string) => boolean }> = [
  {
    id: 'home',
    label: '~/cornerstone',
    match: (pathname) => pathname === '/',
    shortcuts: [
      { keys: ['j/k', '↑↓'], label: 'move' },
      { keys: ['enter'], label: 'open' },
      { keys: ['a/p/n/s'], label: 'jump' },
    ],
  },
  {
    id: 'about',
    label: '~/about',
    match: (pathname) => pathname === '/about',
    shortcuts: [{ keys: ['backspace'], label: 'back' }],
  },
  {
    id: 'blogPost',
    label: '~/posts',
    match: (pathname) => pathname.startsWith('/blog/'),
    shortcuts: [{ keys: ['backspace'], label: 'back' }],
  },
  {
    id: 'blog',
    label: '~/posts',
    match: (pathname) => pathname === '/blog',
    shortcuts: [
      { keys: ['j/k', '↑↓'], label: 'move' },
      { keys: ['enter'], label: 'open' },
      { keys: ['backspace'], label: 'back' },
    ],
  },
  {
    id: 'note',
    label: '~/notes',
    match: (pathname) => pathname === '/note' || pathname.startsWith('/note/'),
    shortcuts: [
      { keys: ['j/k'], label: 'scroll' },
      { keys: ['h/l', '←/→'], label: 'move' },
      { keys: ['f'], label: 'fold' },
      { keys: ['x'], label: 'close active' },
      { keys: ['esc'], label: 'close latest' },
      { keys: ['backspace'], label: 'back' },
    ],
  },
  {
    id: 'sitemap',
    label: '~/map',
    match: (pathname) => pathname === '/sitemap',
    shortcuts: [{ keys: ['backspace'], label: 'back' }],
  },
];

export const getRouteChrome = (pathname: string): RouteChrome => {
  const route = ROUTES.find((entry) => entry.match(pathname));

  if (route) {
    return {
      id: route.id,
      label: route.label,
      shortcuts: route.shortcuts,
    };
  }

  return {
    id: 'default',
    label: '~/cornerstone',
    shortcuts: [{ keys: ['backspace'], label: 'back' }],
  };
};
