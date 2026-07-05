'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { Overlay, Window } from '@/shared/components/tui';
import { cn } from '@/shared/lib/cn';
import type { DocEntry } from '@/shared/lib/explorer-types';
import { usePreview } from '@/shared/lib/use-preview';
import { keymap } from '@/shared/lib/use-shortcuts';

import { CabinetStatusline } from './cabinet-statusline';
import { Cards } from './cards';
import { type CompletionItem, CompletionPopup } from './completion';
import { Peek } from './peek';
import { countByType, filterDocs, tagIndex } from './search';
import { useCompletion } from './use-completion';

export const CABINET_PANEL_ID = 'cabinet-panel';
const CABINET_COMPLETION_ID = 'cabinet-completion-list';

type CabinetProps = {
  open: boolean;
  onClose: () => void;
};

type InteractionMode = 'searching' | 'browsing';

const useCabinetDocs = (open: boolean) => {
  const [docs, setDocs] = useState<DocEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || docs) return;

    let cancelled = false;

    setLoading(true);
    setError(false);

    void fetch('/api/cabinet')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load cabinet index');

        return res.json() as Promise<DocEntry[]>;
      })
      .then((nextDocs) => {
        if (!cancelled) setDocs(nextDocs);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [docs, open]);

  return { docs, error, loading };
};

const CabinetFallback = ({ message }: { message: string }) => (
  <Window className={cn('flex h-[40vh] w-full flex-col bg-vague-surface')}>
    <Window.Title>cabinet</Window.Title>
    <div className={cn('flex min-h-0 flex-1 items-center justify-center px-4 text-sm text-vague-muted')}>
      {message}
    </div>
    <CabinetStatusline />
  </Window>
);

export const Cabinet = ({ open, onClose }: CabinetProps) => {
  const { docs, error, loading } = useCabinetDocs(open);

  return (
    <Overlay
      open={open}
      onClose={onClose}
      label="cabinet"
      id={CABINET_PANEL_ID}
      className="max-w-5xl"
      backdropClassName="bg-vague-bg/25"
    >
      {docs ? (
        <CabinetContent docs={docs} open={open} onClose={onClose} />
      ) : (
        <CabinetFallback message={error ? 'cabinet을 불러오지 못했습니다' : loading ? 'loading cabinet…' : ''} />
      )}
    </Overlay>
  );
};

const CabinetContent = ({ docs, open, onClose }: CabinetProps & { docs: DocEntry[] }) => {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('searching');

  const scopeCounts = useMemo(() => countByType(docs), [docs]);
  const tagList = useMemo(() => tagIndex(docs), [docs]);
  const filtered = useMemo(() => filterDocs(docs, query), [docs, query]);

  const clampedCard = Math.min(cardIndex, Math.max(filtered.length - 1, 0));
  const selected = filtered[clampedCard] ?? null;

  const updateQuery = (next: string) => {
    setInteractionMode((mode) => (mode === 'searching' ? mode : 'searching'));
    setQuery(next);
  };

  const completion = useCompletion(query, updateQuery, scopeCounts, tagList);
  const preview = usePreview(open, selected);
  const activeCompletionId = completion.isOpen ? `${CABINET_COMPLETION_ID}-${completion.index}` : undefined;

  useEffect(() => setCardIndex(0), [query]);
  useEffect(() => {
    if (open) {
      setInteractionMode('searching');
      searchRef.current?.focus();
    }
  }, [open]);

  const openIndex = (index: number) => {
    const doc = filtered[index];

    if (!doc) return;

    onClose();
    router.push(`/${doc.type}/${doc.slug}` as Route);
  };

  const moveCard = (delta: number) => {
    setInteractionMode((mode) => (mode === 'browsing' ? mode : 'browsing'));
    setCardIndex((index) => Math.min(Math.max(index + delta, 0), Math.max(filtered.length - 1, 0)));
  };

  const focusCard = (delta: number) => {
    const cards = cardsRef.current?.querySelectorAll<HTMLButtonElement>('[data-card]');

    if (!cards || cards.length === 0) return;

    const focusedIndex = Array.from(cards).findIndex((card) => card === document.activeElement);
    const currentIndex = focusedIndex >= 0 ? focusedIndex : clampedCard;
    const nextIndex = Math.min(Math.max(currentIndex + delta, 0), cards.length - 1);

    setInteractionMode((mode) => (mode === 'browsing' ? mode : 'browsing'));
    setCardIndex(nextIndex);
    cards[nextIndex]?.focus({ preventScroll: true });
  };

  const acceptCompletion = (item?: CompletionItem) => {
    completion.accept(item);
    searchRef.current?.focus();
  };

  const hoverCard = (index: number) => {
    setInteractionMode((mode) => (mode === 'browsing' ? mode : 'browsing'));
    setCardIndex(index);
  };

  const whenCompleting = () => completion.isOpen;

  const inputKeymap = keymap([
    { key: 'ArrowDown', when: whenCompleting, onTrigger: () => completion.move(1) },
    { key: 'ctrl+n', when: whenCompleting, onTrigger: () => completion.move(1) },
    { key: 'ArrowUp', when: whenCompleting, onTrigger: () => completion.move(-1) },
    { key: 'ctrl+p', when: whenCompleting, onTrigger: () => completion.move(-1) },
    { key: 'Tab', when: whenCompleting, onTrigger: () => acceptCompletion() },
    { key: 'Enter', when: whenCompleting, onTrigger: () => acceptCompletion() },
    { key: 'Escape', when: whenCompleting, onTrigger: () => completion.dismiss() },
    { key: 'ArrowDown', onTrigger: () => moveCard(1) },
    { key: 'ctrl+j', onTrigger: () => moveCard(1) },
    { key: 'ctrl+n', onTrigger: () => moveCard(1) },
    { key: 'ArrowUp', onTrigger: () => moveCard(-1) },
    { key: 'ctrl+k', onTrigger: () => moveCard(-1) },
    { key: 'ctrl+p', onTrigger: () => moveCard(-1) },
    { key: 'Enter', onTrigger: () => openIndex(clampedCard) },
    { key: 'Escape', onTrigger: onClose },
  ]);

  const listKeymap = keymap([
    { key: 'ArrowDown', onTrigger: () => focusCard(1) },
    { key: 'ctrl+j', onTrigger: () => focusCard(1) },
    { key: 'ArrowUp', onTrigger: () => focusCard(-1) },
    { key: 'ctrl+k', onTrigger: () => focusCard(-1) },
  ]);

  return (
    <Window className={cn('flex h-[85vh] w-full flex-col bg-vague-surface')}>
      <Window.Title>cabinet</Window.Title>

      <div className={cn('relative flex items-center gap-2 border-b border-vague-line px-3 py-2')}>
        <span className={cn('text-vague-amber')}>❯</span>
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={inputKeymap}
          role="combobox"
          aria-label="cabinet search"
          aria-autocomplete="list"
          aria-expanded={completion.isOpen}
          aria-controls={completion.isOpen ? CABINET_COMPLETION_ID : undefined}
          aria-activedescendant={activeCompletionId}
          placeholder="검색…  @blog @note  #태그  키워드"
          spellCheck={false}
          autoComplete="off"
          className={cn('flex-1 bg-transparent text-sm text-vague-fg outline-none placeholder:text-vague-muted')}
        />
        <span className={cn('text-xs text-vague-muted')}>{`${filtered.length} / ${docs.length}`}</span>
        {completion.isOpen && (
          <CompletionPopup
            id={CABINET_COMPLETION_ID}
            items={completion.items}
            activeIndex={completion.index}
            onActiveChange={completion.activate}
            onSelect={acceptCompletion}
          />
        )}
      </div>

      <div className={cn('grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]')}>
        <div className={cn('flex min-h-0 flex-col')}>
          <Cards
            items={filtered}
            activeIndex={clampedCard}
            interactionMode={interactionMode}
            listRef={cardsRef}
            onHover={hoverCard}
            onOpen={openIndex}
            onKeyDown={listKeymap}
          />
        </div>

        <Peek entry={selected} html={preview.html} loading={preview.loading} scrollRef={peekRef} />
      </div>

      <CabinetStatusline />
    </Window>
  );
};
