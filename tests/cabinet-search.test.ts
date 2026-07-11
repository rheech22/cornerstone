import { describe, expect, it } from 'vitest';

import { filterDocs, parseQuery } from '../src/app/_shared/components/cabinet/search';
import type { DocEntry } from '../src/app/_shared/lib/explorer-types';

const make = (over: Partial<DocEntry> & Pick<DocEntry, 'slug'>): DocEntry => ({
  type: 'note',
  title: over.slug,
  tags: [],
  updated: '2026-01-01 00:00:00 +0900',
  text: '',
  ...over,
});

const docs: DocEntry[] = [
  make({ slug: 'atomic-write', type: 'note', title: 'Atomic File Write', tags: ['file-system', 'sync'], updated: '2026-06-18 00:00:00 +0900', text: 'atomic file write rename fsync durable storage' }),
  make({ slug: 'zettelkasten', type: 'blog', title: 'Public Zettelkasten', tags: ['zettelkasten', 'note-taking'], updated: '2026-02-01 00:00:00 +0900', text: 'slip box atomic notes linking' }),
  make({ slug: 'old-note', type: 'note', title: 'Ancient History', tags: ['history'], updated: '2024-01-01 00:00:00 +0900', text: 'old content about rename' }),
];

describe('parseQuery', () => {
  it('splits @scope, #tag and keyword terms', () => {
    expect(parseQuery('@blog #zettelkasten atomic Notes')).toEqual({
      scopes: ['blog'],
      tags: ['zettelkasten'],
      terms: ['atomic', 'notes'],
    });
  });

  it('drops unknown @scope tokens (treated as in-progress, not literal terms)', () => {
    expect(parseQuery('@nope hello')).toEqual({ scopes: [], tags: [], terms: ['hello'] });
  });
});

describe('filterDocs', () => {
  it('@blog returns only blog docs', () => {
    expect(filterDocs(docs, '@blog').map((d) => d.slug)).toEqual(['zettelkasten']);
  });

  it('keyword matches body text and ANDs multiple terms', () => {
    expect(filterDocs(docs, 'rename').map((d) => d.slug)).toEqual(['atomic-write', 'old-note']);
    expect(filterDocs(docs, 'rename durable').map((d) => d.slug)).toEqual(['atomic-write']);
  });

  it('combines @scope + #tag + keyword (AND)', () => {
    expect(filterDocs(docs, '@blog #note-taking atomic').map((d) => d.slug)).toEqual([
      'zettelkasten',
    ]);
  });

  it('ranks title matches above body-only matches', () => {
    expect(filterDocs(docs, 'atomic')[0].slug).toBe('atomic-write');
  });

  it('matches English fuzzy terms', () => {
    expect(filterDocs(docs, 'atmc')[0].slug).toBe('atomic-write');
  });

  it('matches Korean choseong terms and ranks tighter matches first', () => {
    const ds = [
      make({ slug: 'jeju-seogwipo', title: '제주특별자치도 서귀포시' }),
      make({ slug: 'jeongseon', title: '정선군' }),
    ];

    expect(filterDocs(ds, 'ㅈㅅㄱ').map((d) => d.slug)).toEqual(['jeongseon', 'jeju-seogwipo']);
  });

  it('matches Korean partial syllable terms', () => {
    const ds = [make({ slug: 'pick', title: '골라 쓰기' })];

    expect(filterDocs(ds, '고라').map((d) => d.slug)).toEqual(['pick']);
  });

  it('matches #tag case-insensitively (#ui ↔ a UI tag, either direction)', () => {
    const ds = [make({ slug: 'x', tags: ['UI', 'Design'], text: 'x' })];

    expect(filterDocs(ds, '#ui').map((d) => d.slug)).toEqual(['x']);
    expect(filterDocs(ds, '#UI').map((d) => d.slug)).toEqual(['x']);
  });
});
