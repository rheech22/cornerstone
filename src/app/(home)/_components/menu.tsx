'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { MENU, type MenuEntry } from '../menu';
import { Explorer,EXPLORER_PANEL_ID } from './explorer/explorer';
import type { DocEntry } from './explorer/types';
import { HelpPanel } from './help-panel';
import { MenuButton } from './menu-button';
import { StatusLine } from './status-line';

export const Menu = ({ docs, children }: { docs: DocEntry[]; children?: React.ReactNode }) => {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(0);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const toggleExplorer = () => setExplorerOpen((open) => !open);
  const toggleHelp = () => setHelpOpen((open) => !open);

  const focusItem = (index: number) => {
    const items = navRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]');

    if (!items || items.length === 0) return;

    const i = ((index % items.length) + items.length) % items.length;

    activeIndexRef.current = i;
    items[i].focus({ preventScroll: true });
  };
  const move = (delta: number) => focusItem(activeIndexRef.current + delta);
  const activate = (item: MenuEntry) =>
    'href' in item ? router.push(item.href) : toggleExplorer();

  useEffect(() => focusItem(0), []);

  useShortcuts(
    [
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
    ],
    { enabled: !explorerOpen },
  );

  return (
    <main className={cn('vague-select flex min-h-dvh flex-col bg-vague-bg font-mono text-vague-fg')}>
      <div className={cn('flex flex-1 items-center justify-center px-6')}>
        <div className={cn('flex w-full max-w-sm flex-col gap-10')}>
          {children}
          <nav ref={navRef} className={cn('flex flex-col gap-3')}>
            <ul className={cn('flex flex-col gap-1')}>
              {MENU.map((item, index) => (
                <li key={item.label}>
                  {'href' in item ? (
                    <MenuButton
                      shortcut={item.shortcut}
                      label={item.label}
                      href={item.href}
                      onFocus={() => {
                        activeIndexRef.current = index;
                      }}
                    />
                  ) : (
                    <MenuButton
                      shortcut={item.shortcut}
                      label={item.label}
                      onClick={toggleExplorer}
                      expanded={explorerOpen}
                      controls={EXPLORER_PANEL_ID}
                      onFocus={() => {
                        activeIndexRef.current = index;
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <StatusLine helpOpen={helpOpen} onToggleHelp={toggleHelp} />
      <Explorer docs={docs} open={explorerOpen} onClose={() => setExplorerOpen(false)} />
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>
  );
};
