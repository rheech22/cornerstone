import { describe, expect, it } from 'vitest';

import { buildNoteStackUrl, MAX_NOTE_STACK_SIZE, parseNoteStackUrl } from '../src/app/note/_components/note-stack-model';

describe('note stack URL codec', () => {
  it('encodes index and nested panels', () => {
    expect(buildNoteStackUrl(['index'])).toBe('/note');
    expect(buildNoteStackUrl(['index', 'csrf', 'xss'])).toBe('/note?n=csrf&n=xss');
    expect(buildNoteStackUrl(['csrf', 'xss'])).toBe('/note/csrf?n=xss');
  });

  it('decodes note URLs', () => {
    expect(parseNoteStackUrl('/note', '?n=csrf&n=xss')).toEqual(['index', 'csrf', 'xss']);
    expect(parseNoteStackUrl('/note/csrf', '?n=xss')).toEqual(['csrf', 'xss']);
  });

  it('rejects unrelated and nested paths', () => {
    expect(parseNoteStackUrl('/blog/csrf', '')).toEqual([]);
    expect(parseNoteStackUrl('/note/a/b', '')).toEqual([]);
    expect(parseNoteStackUrl('/note/%E0%A4%A', '')).toEqual([]);
    expect(parseNoteStackUrl('/note/not-a-real-note', '')).toEqual([]);
  });

  it('limits oversized stacks and removes duplicates', () => {
    const params = new URLSearchParams();

    Array.from({ length: 20 }, () => 'csrf').forEach((slug) => params.append('n', slug));
    ['xss', 'http-basic', 'https-basic', 'cookie-storage'].forEach((slug) => params.append('n', slug));

    const parsed = parseNoteStackUrl('/note', `?${params}`);

    expect(parsed.length).toBeLessThanOrEqual(MAX_NOTE_STACK_SIZE);
    expect(new Set(parsed).size).toBe(parsed.length);
  });
});
