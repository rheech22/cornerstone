'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { MENU, type MenuEntry } from '../menu';
import { EXPLORER_PANEL_ID, ExplorerPanel } from './explorer-panel';
import { HELP_PANEL_ID, HelpPanel } from './help-panel';
import { MenuButton } from './menu-button';

export const Menu = () => {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const toggleExplorer = () => setExplorerOpen((open) => !open);
  const toggleHelp = () => setHelpOpen((open) => !open);

  const focusItem = (index: number) => {
    const items = navRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]');

    items?.[index]?.focus({ preventScroll: true });
  };
  const move = (delta: number) => focusItem((activeIndex + delta + MENU.length) % MENU.length);
  const activate = (item: MenuEntry) =>
    'href' in item ? router.push(item.href) : toggleExplorer();

  useEffect(() => focusItem(0), []);

  useShortcuts([
    ...MENU.map((item, index) => ({
      key: item.shortcut,
      onTrigger: () => {
        focusItem(index);
        activate(item);
      },
    })),
    { key: 'j', onTrigger: () => move(1) },
    { key: 'k', onTrigger: () => move(-1) },
    { key: 'ArrowDown', onTrigger: () => move(1) },
    { key: 'ArrowUp', onTrigger: () => move(-1) },
    { key: '?', onTrigger: toggleHelp },
    { key: '/', onTrigger: toggleHelp },
  ]);

  return (
    <>
      <nav ref={navRef} className={cn('flex flex-col gap-3')}>
        <ul className={cn('flex flex-col gap-1')}>
          {MENU.map((item, index) => (
            <li key={item.label}>
              {'href' in item ? (
                <MenuButton
                  shortcut={item.shortcut}
                  label={item.label}
                  href={item.href}
                  onFocus={() => setActiveIndex(index)}
                />
              ) : (
                <MenuButton
                  shortcut={item.shortcut}
                  label={item.label}
                  onClick={toggleExplorer}
                  expanded={explorerOpen}
                  controls={EXPLORER_PANEL_ID}
                  onFocus={() => setActiveIndex(index)}
                />
              )}
            </li>
          ))}
        </ul>
        <ExplorerPanel open={explorerOpen} />
        <button
          type="button"
          onClick={toggleHelp}
          aria-expanded={helpOpen}
          aria-controls={HELP_PANEL_ID}
          className={cn('self-start text-xs text-vague-muted transition-colors hover:text-vague-fg')}
        >
          <span className={cn('text-vague-amber')}>?</span> help
        </button>
      </nav>
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};
