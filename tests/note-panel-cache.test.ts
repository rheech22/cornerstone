import { describe, expect, it, vi } from 'vitest';

import type { NotePanelArtifact } from '../src/app/note/_components/note-panel-artifact';
import { NotePanelCache } from '../src/app/note/_components/note-panel-cache';

const artifact = (slug: string): NotePanelArtifact => ({ html: `<section>${slug}</section>`, slug, version: 1 });

describe('NotePanelCache', () => {
  it('deduplicates in-flight loads', async () => {
    const loader = vi.fn(async (slug: string) => artifact(slug));
    const cache = new NotePanelCache(loader);

    const [first, second] = await Promise.all([cache.load('csrf'), cache.load('csrf')]);

    expect(first).toEqual(second);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('evicts the least recently used unpinned artifact', () => {
    const cache = new NotePanelCache(async (slug) => artifact(slug), 2);

    cache.seed(artifact('a'));
    cache.seed(artifact('b'));
    cache.peek('a');
    cache.seed(artifact('c'));

    expect(cache.peek('a')).toBeDefined();
    expect(cache.peek('b')).toBeUndefined();
    expect(cache.peek('c')).toBeDefined();
  });

  it('removes rejected loads so they can be retried', async () => {
    const loader = vi.fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(artifact('csrf'));
    const cache = new NotePanelCache(loader);

    await expect(cache.load('csrf')).rejects.toThrow('network');
    await expect(cache.load('csrf')).resolves.toEqual(artifact('csrf'));
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('does not overwrite a newer seed when an older request settles', async () => {
    let resolve!: (value: NotePanelArtifact) => void;
    const loader = () => new Promise<NotePanelArtifact>((done) => {
      resolve = done;
    });
    const cache = new NotePanelCache(loader);
    const pending = cache.load('csrf');
    const newer = { ...artifact('csrf'), html: '<section>newer</section>' };

    cache.seed(newer);
    resolve(artifact('csrf'));
    await pending;

    expect(cache.peek('csrf')).toEqual(newer);
  });
});
