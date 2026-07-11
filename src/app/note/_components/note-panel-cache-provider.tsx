'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useRef } from 'react';

import { fetchNotePanelArtifact } from './note-panel-artifact';
import { NotePanelCache } from './note-panel-cache';

const NotePanelCacheContext = createContext<NotePanelCache | null>(null);

export const NotePanelCacheProvider = ({ children }: { children: ReactNode }) => {
  const cacheRef = useRef<NotePanelCache | null>(null);

  cacheRef.current ??= new NotePanelCache(fetchNotePanelArtifact);

  return <NotePanelCacheContext.Provider value={cacheRef.current}>{children}</NotePanelCacheContext.Provider>;
};

export const useNotePanelCache = (): NotePanelCache => {
  const cache = useContext(NotePanelCacheContext);

  if (!cache) throw new Error('useNotePanelCache must be used within NotePanelCacheProvider');

  return cache;
};
