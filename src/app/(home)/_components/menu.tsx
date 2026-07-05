'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useAppChrome } from '@/shared/components/chrome/app-chrome';
import { cn } from '@/shared/lib/cn';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { MENU, type MenuEntry } from '../menu';
import { MenuButton } from './menu-button';

export const Menu = ({ children }: { children?: React.ReactNode }) => {
  const router = useRouter();
  const { cabinetOpen, modalOpen, openCabinet } = useAppChrome();
  const navRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(0);

  const openMenuCabinet = () => {
    openCabinet();
  };

  const focusItem = (index: number) => {
    const items = navRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]');

    if (!items || items.length === 0) return;

    const i = ((index % items.length) + items.length) % items.length;

    activeIndexRef.current = i;
    items[i].focus({ preventScroll: true });
  };
  const move = (delta: number) => focusItem(activeIndexRef.current + delta);
  const activate = (item: MenuEntry) =>
    'href' in item ? router.push(item.href) : openMenuCabinet();

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
    ],
    { enabled: !modalOpen },
  );

  return (
    <main className={cn('vague-select flex min-h-0 flex-1 flex-col bg-vague-bg text-vague-fg')}>
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
                      onClick={openMenuCabinet}
                      expanded={cabinetOpen}
                      controls="cabinet-panel"
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
    </main>
  );
};
