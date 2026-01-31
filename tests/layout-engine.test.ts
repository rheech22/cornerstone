import { describe, expect, it } from 'vitest';
import { generateLayout } from '../src/app/lib/layout-engine';
import type { Post } from '../src/app/lib/layout-types';

type Rect = { row: number; col: number; w: number; h: number; type: 'S' | 'MX' | 'MY' | 'L' };

const GRID_COLS = 8;
const BAND_SIZE = 2;

function createPosts(count: number): Post[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `post-${i + 1}`,
    title: `Post ${i + 1}`,
    created: '2024-01-01',
    updated: '2024-01-01',
    tags: [],
    contentLength: i % 10 === 0 ? 2400 : i % 3 === 0 ? 900 : 400,
    type: i % 2 === 0 ? 'blog' : 'note'
  }));
}

function getDimensions(type: 'S' | 'MX' | 'MY' | 'L'): { w: number; h: number } {
  switch (type) {
    case 'S':
      return { w: 1, h: 1 };
    case 'MX':
      return { w: 2, h: 1 };
    case 'MY':
      return { w: 1, h: 2 };
    case 'L':
      return { w: 2, h: 2 };
  }
}

function isOrthogonallyAdjacent(a: Rect, b: Rect): boolean {
  const aRight = a.col + a.w;
  const bRight = b.col + b.w;
  const aBottom = a.row + a.h;
  const bBottom = b.row + b.h;

  const rowOverlap = !(aBottom <= b.row || bBottom <= a.row);
  const colOverlap = !(aRight <= b.col || bRight <= a.col);

  const touchesVertically = (aBottom === b.row || bBottom === a.row) && colOverlap;
  const touchesHorizontally = (aRight === b.col || bRight === a.col) && rowOverlap;

  return touchesVertically || touchesHorizontally;
}

function buildGrid(
  rows: number,
  placements: { postId: string; row: number; col: number; w: number; h: number }[]
): string[][] {
  const grid = Array.from({ length: rows }, () => Array(GRID_COLS).fill(''));
  for (const placement of placements) {
    for (let r = placement.row; r < placement.row + placement.h; r++) {
      for (let c = placement.col; c < placement.col + placement.w; c++) {
        expect(grid[r][c], `Overlap at ${r},${c}`).toBe('');
        grid[r][c] = placement.postId;
      }
    }
  }
  return grid;
}

function checkMediumChains(placements: Rect[], type: 'MX' | 'MY'): void {
  const nodes = placements.filter(p => p.w === (type === 'MX' ? 2 : 1) && p.h === (type === 'MX' ? 1 : 2));
  const visited = new Set<number>();

  for (let i = 0; i < nodes.length; i++) {
    if (visited.has(i)) continue;
    const queue = [i];
    const component: number[] = [];
    visited.add(i);

    while (queue.length > 0) {
      const idx = queue.shift()!;
      component.push(idx);
      for (let j = 0; j < nodes.length; j++) {
        if (visited.has(j)) continue;
        if (isOrthogonallyAdjacent(nodes[idx], nodes[j])) {
          visited.add(j);
          queue.push(j);
        }
      }
    }

    expect(component.length).toBeLessThanOrEqual(2);
  }
}

describe('layout-engine', () => {
  it('generates deterministic layout for same seed', () => {
    const posts = createPosts(100);
    const layoutA = generateLayout(posts, 1234);
    const layoutB = generateLayout(posts, 1234);

    expect(layoutA).toBeTruthy();
    expect(layoutB).toBeTruthy();
    if (!layoutA || !layoutB) return;
    expect(layoutA.placements).toEqual(layoutB.placements);
  });

  it('respects placement bounds and sizes', () => {
    const posts = createPosts(100);
    const layout = generateLayout(posts, 5678);

    expect(layout).toBeTruthy();
    if (!layout) return;

    const maxRow = Math.max(0, ...layout.placements.map(p => p.row + p.h));
    expect(maxRow).toBeLessThanOrEqual(layout.rows);

    for (const placement of layout.placements) {
      const dims = getDimensions(placement.type);
      expect(placement.w).toBe(dims.w);
      expect(placement.h).toBe(dims.h);
      expect(placement.col).toBeGreaterThanOrEqual(0);
      expect(placement.col + placement.w).toBeLessThanOrEqual(GRID_COLS);
      expect(placement.row).toBeGreaterThanOrEqual(0);
      expect(placement.row + placement.h).toBeLessThanOrEqual(layout.rows);
    }

    buildGrid(layout.rows, layout.placements);
  });

  it('enforces adjacency and band rules', () => {
    const posts = createPosts(100);
    const layout = generateLayout(posts, 91011);

    expect(layout).toBeTruthy();
    if (!layout) return;

    const rects: Rect[] = layout.placements.map(p => ({
      row: p.row,
      col: p.col,
      w: p.w,
      h: p.h,
      type: p.type
    }));

    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        if (a.type === 'L' && b.type === 'L') {
          expect(isOrthogonallyAdjacent(a, b)).toBe(false);
        }
        if ((a.type === 'MX' && b.type === 'MY') || (a.type === 'MY' && b.type === 'MX')) {
          expect(isOrthogonallyAdjacent(a, b)).toBe(false);
        }
      }
    }

    checkMediumChains(rects, 'MX');
    checkMediumChains(rects, 'MY');

    const blogIds = new Set(posts.filter(post => post.type === 'blog').map(post => post.id));
    const noteIds = new Set(posts.filter(post => post.type === 'note').map(post => post.id));
    const placementById = new Map(layout.placements.map(p => [p.postId, p]));

    for (const id of blogIds) {
      const placement = placementById.get(id);
      expect(placement).toBeTruthy();
      if (!placement) continue;
      expect(placement.type).toBe('L');
    }

    for (const id of noteIds) {
      const placement = placementById.get(id);
      expect(placement).toBeTruthy();
      if (!placement) continue;
      expect(placement.type).not.toBe('L');
    }

    for (let bandStart = 0; bandStart < layout.rows; bandStart += BAND_SIZE) {
      const bandEnd = bandStart + BAND_SIZE - 1;
      const lInBand = layout.placements.filter(p =>
        p.type === 'L' &&
        p.row <= bandEnd &&
        p.row + p.h - 1 >= bandStart
      );
      expect(lInBand.length).toBeLessThanOrEqual(1);

      const mxInBand = layout.placements.filter(p =>
        p.type === 'MX' &&
        p.row <= bandEnd &&
        p.row + p.h - 1 >= bandStart
      );
      const myInBand = layout.placements.filter(p =>
        p.type === 'MY' &&
        p.row <= bandEnd &&
        p.row + p.h - 1 >= bandStart
      );
      const noteInBand = layout.placements.filter(p =>
        p.type !== 'L' &&
        p.row <= bandEnd &&
        p.row + p.h - 1 >= bandStart
      );

      if (noteInBand.length > 0) {
        expect(mxInBand.length).toBeGreaterThanOrEqual(1);
        expect(myInBand.length).toBeGreaterThanOrEqual(1);
      }
    }

    const mxRects = rects.filter(rect => rect.type === 'MX');
    for (let i = 0; i < mxRects.length; i++) {
      for (let j = i + 1; j < mxRects.length; j++) {
        const a = mxRects[i];
        const b = mxRects[j];
        const sameRow = a.row === b.row && a.h === 1 && b.h === 1;
        if (!sameRow) continue;
        const touchesLeft = a.col + a.w === b.col;
        const touchesRight = b.col + b.w === a.col;
        expect(touchesLeft || touchesRight).toBe(false);
      }
    }
  });
});
