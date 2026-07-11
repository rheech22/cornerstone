import type { NotePanelArtifact } from './note-panel-artifact';

type CacheEntry = {
  artifact?: NotePanelArtifact;
  lastUsed: number;
  promise?: Promise<NotePanelArtifact>;
};

type ArtifactLoader = (slug: string) => Promise<NotePanelArtifact>;

export class NotePanelCache {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly loadArtifact: ArtifactLoader;
  private clock = 0;
  private pinned = new Set<string>();

  constructor(loadArtifact: ArtifactLoader, maxSize = 32) {
    this.loadArtifact = loadArtifact;
    this.maxSize = maxSize;
  }

  peek(slug: string): NotePanelArtifact | undefined {
    const entry = this.entries.get(slug);

    if (!entry?.artifact) return undefined;

    entry.lastUsed = ++this.clock;

    return entry.artifact;
  }

  has(slug: string): boolean {
    return Boolean(this.entries.get(slug)?.artifact);
  }

  seed(artifact: NotePanelArtifact): void {
    this.entries.set(artifact.slug, { artifact, lastUsed: ++this.clock });
    this.evict();
  }

  async load(slug: string): Promise<NotePanelArtifact> {
    const cached = this.peek(slug);

    if (cached) return cached;

    const existing = this.entries.get(slug)?.promise;

    if (existing) return existing;

    const promise = this.loadArtifact(slug)
      .then((artifact) => {
        if (this.entries.get(slug)?.promise === promise) this.seed(artifact);

        return artifact;
      })
      .catch((error: unknown) => {
        if (this.entries.get(slug)?.promise === promise) this.entries.delete(slug);
        throw error;
      });

    this.entries.set(slug, { lastUsed: ++this.clock, promise });

    return promise;
  }

  prefetch(slug: string): void {
    void this.load(slug).catch(() => undefined);
  }

  pin(slugs: string[]): void {
    this.pinned = new Set(slugs);
    this.evict();
  }

  private evict(): void {
    const resolved = [...this.entries.entries()]
      .filter(([slug, entry]) => entry.artifact && !this.pinned.has(slug))
      .sort(([, a], [, b]) => a.lastUsed - b.lastUsed);

    while (this.entries.size > this.maxSize && resolved.length > 0) {
      const [slug] = resolved.shift()!;

      this.entries.delete(slug);
    }
  }
}
