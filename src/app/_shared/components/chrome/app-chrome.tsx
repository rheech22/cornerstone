'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';

import { Cabinet } from '@/shared/components/cabinet/cabinet';
import { cn } from '@/shared/lib/cn';
import { useShortcuts } from '@/shared/lib/use-shortcuts';

import { GlobalHelpPanel } from './global-help-panel';
import { GlobalStatusBar } from './global-status-bar';
import { getRouteChrome } from './route-chrome';

type AppChromeActions = {
  cabinetOpen: boolean;
  modalOpen: boolean;
  openCabinet: () => void;
  openHelp: () => void;
};

const AppChromeContext = createContext<AppChromeActions | null>(null);

export const useAppChrome = () => {
  const value = useContext(AppChromeContext);

  if (!value) throw new Error('useAppChrome must be used inside AppChrome');

  return value;
};

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
  const [helpOpen, setHelpOpen] = useState(false);
  const modalOpen = cabinetOpen || helpOpen;

  const openCabinet = () => setCabinetOpen(true);
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
    <AppChromeContext.Provider value={{ cabinetOpen, modalOpen, openCabinet, openHelp }}>
      <div className={cn('flex min-h-0 flex-1 flex-col')}>
        {breadcrumbs}
        <div className={cn('flex min-h-0 flex-1 flex-col')}>{children}</div>
        <GlobalStatusBar helpOpen={helpOpen} route={route} onToggleHelp={toggleHelp} />
        <Cabinet open={cabinetOpen} onClose={() => setCabinetOpen(false)} />
        <GlobalHelpPanel open={helpOpen} route={route} onClose={() => setHelpOpen(false)} />
      </div>
    </AppChromeContext.Provider>
  );
};
