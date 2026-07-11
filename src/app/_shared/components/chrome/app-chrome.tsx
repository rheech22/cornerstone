'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import { CabinetStatusline } from '@/shared/components/cabinet/cabinet-statusline';
import { Overlay, Window } from '@/shared/components/tui';
import { cn } from '@/shared/lib/cn';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { GlobalHelpPanel } from './global-help-panel';
import { GlobalStatusBar } from './global-status-bar';
import { getRouteChrome } from './route-chrome';

const loadCabinet = () => import('@/shared/components/cabinet/cabinet').then((mod) => mod.Cabinet);

type AppChromeActions = {
  cabinetOpen: boolean;
  modalOpen: boolean;
  openCabinet: () => void;
  closeCabinet: () => void;
  preloadCabinet: () => void;
  openHelp: () => void;
};

const AppChromeContext = createContext<AppChromeActions | null>(null);

export const useAppChrome = () => {
  const value = useContext(AppChromeContext);

  if (!value) throw new Error('useAppChrome must be used inside AppChrome');

  return value;
};

const CabinetLoading = () => {
  const { cabinetOpen, closeCabinet } = useAppChrome();

  return (
    <Overlay
      open={cabinetOpen}
      onClose={closeCabinet}
      label="cabinet"
      id="cabinet-panel"
      className={cn('max-w-5xl')}
      backdropClassName={cn('bg-vague-bg/25')}
    >
      <Window className={cn('flex h-[85vh] w-full flex-col bg-vague-surface')}>
        <Window.Title>cabinet</Window.Title>
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className={cn('flex min-h-0 flex-1 items-center justify-center px-4 text-sm text-vague-muted')}
        >
          indexing the archive…
        </div>
        <CabinetStatusline />
      </Window>
    </Overlay>
  );
};

const Cabinet = dynamic(loadCabinet, { loading: CabinetLoading });

export const AppChrome = ({
  breadcrumbs,
  children,
}: {
  breadcrumbs: ReactNode;
  children: ReactNode;
}) => {
  const pathname = usePathname();
  const route = getRouteChrome(pathname);
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [cabinetMounted, setCabinetMounted] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const modalOpen = cabinetOpen || helpOpen;

  const preloadCabinet = () => {
    void loadCabinet();
  };

  const openCabinet = () => {
    preloadCabinet();
    setCabinetMounted(true);
    setCabinetOpen(true);
  };
  const closeCabinet = () => setCabinetOpen(false);
  const openHelp = () => setHelpOpen(true);
  const toggleHelp = () => setHelpOpen((open) => !open);

  useShortcuts(
    [
      { key: 'c', onTrigger: openCabinet },
      { key: '?', onTrigger: toggleHelp },
      { key: '/', onTrigger: toggleHelp },
    ],
    { enabled: !modalOpen },
  );

  return (
    <AppChromeContext.Provider value={{ cabinetOpen, modalOpen, openCabinet, closeCabinet, openHelp, preloadCabinet }}>
      <div className={cn('flex min-h-0 flex-1 flex-col')}>
        {breadcrumbs}
        <div className={cn('flex min-h-0 flex-1 flex-col')}>{children}</div>
        <GlobalStatusBar helpOpen={helpOpen} route={route} onToggleHelp={toggleHelp} />
        {cabinetMounted && <Cabinet open={cabinetOpen} onClose={closeCabinet} />}
        <GlobalHelpPanel open={helpOpen} route={route} onClose={() => setHelpOpen(false)} />
      </div>
    </AppChromeContext.Provider>
  );
};
