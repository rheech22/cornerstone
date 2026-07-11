'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAppChrome } from '@/shared/components/chrome/app-chrome';
import { cn } from '@/shared/lib/cn';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { MENU, type MenuEntry } from '../menu';
import { MenuButton } from './menu-button';

export const Menu = ({ children }: { children?: React.ReactNode }) => {
  const router = useRouter();
  const { cabinetOpen, modalOpen, openCabinet, preloadCabinet } = useAppChrome();
  const navRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [browsing, setBrowsing] = useState(false);

  const openMenuCabinet = () => {
    openCabinet();
  };

  const activateItem = (index: number) => {
    if (browsing && activeIndexRef.current === index) return;

    activeIndexRef.current = index;
    setActiveIndex(index);
    setBrowsing(true);
  };

  const focusItem = (index: number) => {
    const items = navRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]');

    if (!items || items.length === 0) return;

    const i = ((index % items.length) + items.length) % items.length;

    activateItem(i);
    items[i].focus({ preventScroll: true });
  };
  const move = (delta: number) => focusItem(activeIndexRef.current + delta);
  const activate = (item: MenuEntry) =>
    'href' in item ? router.push(item.href) : openMenuCabinet();

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
    <main
      onPointerDown={(event) => {
        if (!navRef.current?.contains(event.target as Node)) setBrowsing(false);
      }}
      className={cn('vague-select flex min-h-0 flex-1 flex-col bg-vague-bg text-vague-fg')}
    >
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
                      active={browsing && index === activeIndex}
                      browsing={browsing}
                      onActivate={() => activateItem(index)}
                    />
                  ) : (
                    <MenuButton
                      shortcut={item.shortcut}
                      label={item.label}
                      onClick={openMenuCabinet}
                      expanded={cabinetOpen}
                      controls="cabinet-panel"
                      active={browsing && index === activeIndex}
                      browsing={browsing}
                      onActivate={() => activateItem(index)}
                      onFocus={() => {
                        activateItem(index);
                        preloadCabinet();
                      }}
                      onPointerEnter={preloadCabinet}
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
