'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

import { MENU } from '../menu';
import { EXPLORER_PANEL_ID, ExplorerPanel } from './explorer-panel';
import { MenuButton } from './menu-button';

export const Menu = () => {
  const [explorerOpen, setExplorerOpen] = useState(false);

  return (
    <nav className={cn('flex flex-col gap-3')}>
      <ul className={cn('flex flex-col gap-1')}>
        {MENU.map((item) => (
          <li key={item.label}>
            {'href' in item ? (
              <MenuButton shortcut={item.shortcut} label={item.label} href={item.href} />
            ) : (
              <MenuButton
                shortcut={item.shortcut}
                label={item.label}
                onClick={() => setExplorerOpen((open) => !open)}
                expanded={explorerOpen}
                controls={EXPLORER_PANEL_ID}
              />
            )}
          </li>
        ))}
      </ul>
      <ExplorerPanel open={explorerOpen} />
    </nav>
  );
};
