'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { Overlay, Window } from '@/shared/components/tui';
import { cn } from '@/shared/lib/cn';
import { keymap } from '@/shared/lib/use-shortcuts';

import { CabinetStatusline } from './cabinet-statusline';
import { Cards } from './cards';
import { type CompletionItem, CompletionPopup } from './completion';
import { Peek } from './peek';
import { countByType, filterDocs, parseQuery, tagIndex } from './search';
import type { DocEntry } from './types';
import { useCompletion } from './use-completion';
import { usePreview } from './use-preview';

export const EXPLORER_PANEL_ID = 'explorer-panel';

type ExplorerProps = {
  docs: DocEntry[];
  open: boolean;
  onClose: () => void;
};

export const Explorer = ({ docs, open, onClose }: ExplorerProps) => {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState('');
  const [cardIndex, setCardIndex] = useState(0);

  const scopeCounts = useMemo(() => countByType(docs), [docs]);
  const tagList = useMemo(() => tagIndex(docs), [docs]);
  const filtered = useMemo(() => filterDocs(docs, query), [docs, query]);

  const clampedCard = Math.min(cardIndex, Math.max(filtered.length - 1, 0));
  const selected = filtered[clampedCard] ?? null;

  const completion = useCompletion(query, setQuery, scopeCounts, tagList);
  const preview = usePreview(open, selected);

  useEffect(() => setCardIndex(0), [query]);
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const openIndex = (index: number) => {
    const doc = filtered[index];

    if (!doc) return;

    onClose();
    router.push(`/${doc.type}/${doc.slug}` as Route);
  };

  const moveCard = (delta: number) =>
    setCardIndex(() => Math.min(Math.max(clampedCard + delta, 0), Math.max(filtered.length - 1, 0)));

  const focusCard = (index: number) => {
    const cards = cardsRef.current?.querySelectorAll<HTMLButtonElement>('[data-card]');

    if (!cards || cards.length === 0) return;

    cards[Math.min(Math.max(index, 0), cards.length - 1)].focus({ preventScroll: true });
  };

  const acceptCompletion = (item?: CompletionItem) => {
    completion.accept(item);
    searchRef.current?.focus();
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
    { key: 'ArrowDown', onTrigger: () => focusCard(clampedCard + 1) },
    { key: 'ctrl+j', onTrigger: () => focusCard(clampedCard + 1) },
    { key: 'ArrowUp', onTrigger: () => focusCard(clampedCard - 1) },
    { key: 'ctrl+k', onTrigger: () => focusCard(clampedCard - 1) },
  ]);

  const { scopes, tags } = parseQuery(query);
  const filterLabel = [...scopes.map((s) => `@${s}`), ...tags.map((t) => `#${t}`)].join(' ') || 'all';

  return (
    <Overlay
      open={open}
      onClose={onClose}
      label="explorer"
      id={EXPLORER_PANEL_ID}
      className="max-w-5xl"
      backdropClassName="bg-vague-bg/25"
    >
      <Window className={cn('flex h-[85vh] w-full flex-col bg-vague-surface/40 backdrop-blur-md')}>
        <Window.Title>cabinet</Window.Title>

        <div className={cn('relative flex items-center gap-2 border-b border-vague-line px-3 py-2')}>
          <span className={cn('text-vague-amber')}>❯</span>
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={inputKeymap}
            placeholder="검색…  @blog @note  #태그  키워드"
            spellCheck={false}
            autoComplete="off"
            className={cn('flex-1 bg-transparent text-sm text-vague-fg outline-none placeholder:text-vague-muted')}
          />
          <span className={cn('text-xs text-vague-muted')}>{`${filtered.length} / ${docs.length}`}</span>
          {completion.isOpen && (
            <CompletionPopup
              items={completion.items}
              activeIndex={completion.index}
              onSelect={acceptCompletion}
            />
          )}
        </div>

        <div className={cn('grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]')}>
          <div className={cn('flex min-h-0 flex-col')}>
            <Cards
              items={filtered}
              activeIndex={clampedCard}
              listRef={cardsRef}
              onHover={setCardIndex}
              onOpen={openIndex}
              onKeyDown={listKeymap}
            />
          </div>

          <Peek entry={selected} html={preview.html} loading={preview.loading} scrollRef={peekRef} />
        </div>

        <CabinetStatusline
          mode={query.trim() ? 'SEARCH' : 'BROWSE'}
          filterLabel={filterLabel}
          matched={filtered.length}
          total={docs.length}
        />
      </Window>
    </Overlay>
  );
};
