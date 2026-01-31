import type { CardType, LayoutConfig, LayoutResult, Placement, Post, Targets } from './layout-types';

type LayoutEngineOptions = {
  seed?: number;
  config?: Partial<LayoutConfig>;
  random?: () => number;
};

const DEFAULT_CONFIG: LayoutConfig = {
  gridCols: 8,
  bandSize: 2,
  emptyBand: 2,
  lBandGap: 0,
  targetM: 0.5,
  targetMX: 0.75,
  emptyProbability: 0.12,
  mediumContentLength: 700
};

class LayoutEngine {
  private posts: Post[];
  private grid: (string | null)[][] = [];
  private placements: Placement[] = [];
  private seed: number;
  private config: LayoutConfig;
  private randomSource?: () => number;

  constructor(posts: Post[], options: LayoutEngineOptions = {}) {
    this.posts = [...posts];
    this.seed = options.seed ?? Math.floor(Math.random() * 1000000);
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this.randomSource = options.random;
  }

  private random(): number {
    if (this.randomSource) return this.randomSource();
    this.seed = (this.seed * 9301 + 49297) % 233280;

    return this.seed / 233280;
  }

  private getCardDimensions(type: CardType): { w: number; h: number } {
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

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private computeTargets(posts: Post[]): Targets {
    const total = posts.length;
    const blogCount = posts.filter(post => post.type === 'blog').length;
    const minS = Math.ceil(total * 0.3);
    const minM = Math.ceil(total * 0.3);
    const maxM = Math.floor(total * 0.5);

    const targetL = blogCount;
    let targetM = this.clamp(Math.round(total * this.config.targetM), minM, maxM);
    let targetS = total - targetL - targetM;

    if (targetS < 0) {
      targetM = Math.max(0, total - targetL);
      targetS = 0;
    }

    while (targetS < minS && targetM > minM) {
      targetM--;
      targetS++;
    }

    const targetMX = Math.max(0, Math.round(targetM * this.config.targetMX));
    const targetMY = Math.max(0, targetM - targetMX);

    return {
      l: targetL,
      mx: targetMX,
      my: targetMY,
      s: targetS,
      minL: blogCount,
      maxL: blogCount,
      minS,
      minM,
      maxM
    };
  }

  private canPlaceAt(row: number, col: number, w: number, h: number): boolean {
    if (col + w > this.config.gridCols) return false;
    for (let r = row; r < row + h; r++) {
      if (r >= this.grid.length) continue;
      for (let c = col; c < col + w; c++) {
        if (this.grid[r][c] !== null) return false;
      }
    }

    return true;
  }

  private isOrthogonallyAdjacent(
    a: { row: number; col: number; w: number; h: number },
    b: { row: number; col: number; w: number; h: number }
  ): boolean {
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

  private isAdjacentToType(row: number, col: number, w: number, h: number, type: CardType): boolean {
    const rect = { row, col, w, h };

    return this.placements.some(placement =>
      placement.type === type && this.isOrthogonallyAdjacent(rect, placement)
    );
  }

  private isHorizontallyAdjacentMX(row: number, col: number, w: number): boolean {
    return this.placements.some(placement => {
      if (placement.type !== 'MX') return false;
      if (placement.row !== row || placement.h !== 1) return false;
      const touchesLeft = placement.col + placement.w === col;
      const touchesRight = col + w === placement.col;
      return touchesLeft || touchesRight;
    });
  }

  private wouldCreateMediumChain(row: number, col: number, w: number, h: number, type: CardType): boolean {
    const newPlacement: Placement = { postId: '__new__', row, col, w, h, type };
    const nodes = this.placements.filter(p => p.type === type).concat(newPlacement);
    const visited = new Set<Placement>();

    for (const start of nodes) {
      if (visited.has(start)) continue;
      const queue = [start];
      const component: Placement[] = [];

      visited.add(start);

      while (queue.length > 0) {
        const current = queue.shift()!;

        component.push(current);
        for (const other of nodes) {
          if (visited.has(other)) continue;
          if (this.isOrthogonallyAdjacent(current, other)) {
            visited.add(other);
            queue.push(other);
          }
        }
      }

      if (component.length > 2) return true;
    }

    return false;
  }

  private wouldCreateLargeSBlock(row: number, col: number, w: number, h: number): boolean {
    const checkSizes: Array<[number, number]> = [
      [3, 2],
      [2, 3],
      [4, 2],
      [2, 4],
      [3, 3],
      [4, 4]
    ];

    for (const [cw, ch] of checkSizes) {
      for (let r = row - (ch - 1); r <= row + h - 1; r++) {
        for (let c = col - (cw - 1); c <= col + w - 1; c++) {
          if (r < 0 || c < 0) continue;
          if (r + ch > this.grid.length) continue;
          if (c + cw > this.config.gridCols) continue;
          if (this.isAllS(r, c, cw, ch, row, col, w, h)) return true;
        }
      }
    }

    return false;
  }

  private isAllS(
    r0: number,
    c0: number,
    w: number,
    h: number,
    newRow: number,
    newCol: number,
    newW: number,
    newH: number
  ): boolean {
    for (let r = r0; r < r0 + h; r++) {
      for (let c = c0; c < c0 + w; c++) {
        const inNew = r >= newRow && r < newRow + newH && c >= newCol && c < newCol + newW;

        if (inNew) continue;
        const cell = this.grid[r][c];

        if (!cell || !cell.startsWith('S_')) return false;
      }
    }

    return true;
  }

  private wouldCreateFullSRow(row: number, col: number, w: number, h: number): boolean {
    const rowsToCheck = [row, row + 1];

    for (const r of rowsToCheck) {
      if (r < 0 || r >= this.grid.length) continue;
      let allS = true;

      for (let c = 0; c < this.config.gridCols; c++) {
        const inNew = r >= row && r < row + h && c >= col && c < col + w;

        if (inNew) continue;
        const cell = this.grid[r][c];

        if (!cell || !cell.startsWith('S_')) {
          allS = false;
          break;
        }
      }
      if (allS) return true;
    }

    return false;
  }

  private getRequiredEmpty(
    filledCells: number,
    emptyCount: number,
    targets: Targets,
    counts: { l: number; mx: number; my: number; s: number },
    remainingPosts: number
  ): number {
    const projectedRemainingCells =
      Math.max(0, targets.l - counts.l) * 4 +
      Math.max(0, targets.mx - counts.mx) * 2 +
      Math.max(0, targets.my - counts.my) * 2 +
      Math.max(0, targets.s - counts.s) * 1;
    const minRemainingCells = remainingPosts * 1;
    const totalProjectedCells = filledCells + emptyCount + Math.max(projectedRemainingCells, minRemainingCells);

    return Math.ceil(totalProjectedCells * 0.1);
  }

  private shouldPlaceEmpty(
    row: number,
    col: number,
    currentRows: number,
    emptyCount: number,
    emptyCountInBand6: Map<number, number>,
    emptyPerCol: number[],
    filledCells: number,
    targets: Targets,
    counts: { l: number; mx: number; my: number; s: number },
    remainingPosts: number
  ): boolean {
    if (row === 0) return false;
    const band6 = Math.floor(row / this.config.emptyBand);
    const emptyInBand = emptyCountInBand6.get(band6) || 0;
    const isLastRowInBand = row % this.config.emptyBand === this.config.emptyBand - 1;
    const requiredEmpty = this.getRequiredEmpty(filledCells, emptyCount, targets, counts, remainingPosts);

    const colLimit = Math.floor(currentRows * 0.4);

    if (emptyPerCol[col] + 1 > colLimit) return false;
    if (isLastRowInBand && emptyInBand === 0) return true;
    if (emptyCount < requiredEmpty) return this.random() < this.config.emptyProbability;

    return false;
  }

  private canPlaceEmpty(row: number, col: number): boolean {
    if (this.grid[row][col] !== null) return false;
    const clusterSize = this.getEmptyClusterSize(row, col);

    return clusterSize <= 3;
  }

  private getEmptyClusterSize(row: number, col: number): number {
    const visited = new Set<string>();
    const queue: Array<[number, number]> = [[row, col]];
    let size = 0;

    while (queue.length > 0 && size <= 4) {
      const [r, c] = queue.shift()!;
      const key = `${r},${c}`;

      if (visited.has(key)) continue;
      visited.add(key);
      size++;

      const neighbors: Array<[number, number]> = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1]
      ];

      for (const [nr, nc] of neighbors) {
        if (nr < 0 || nc < 0 || nr >= this.grid.length || nc >= this.config.gridCols) continue;
        const cell = this.grid[nr][nc];

        if (cell === 'EMPTY' && !visited.has(`${nr},${nc}`)) queue.push([nr, nc]);
      }
    }

    return size;
  }

  private placeCard(post: Post, row: number, col: number, w: number, h: number, type: CardType, id: number): void {
    const cardId = `${type}_${id}`;

    for (let r = row; r < row + h; r++) {
      if (r >= this.grid.length) {
        this.grid.push(Array(this.config.gridCols).fill(null));
      }
      for (let c = col; c < col + w; c++) {
        this.grid[r][c] = cardId;
      }
    }

    this.placements.push({
      postId: post.id,
      row,
      col,
      w,
      h,
      type
    });
  }

  private takePostForType(posts: Post[], type: CardType): Post | null {
    const wantBlog = type === 'L';
    const index = posts.findIndex(post => (post.type === 'blog') === wantBlog);
    if (index === -1) return null;
    const [post] = posts.splice(index, 1);
    return post;
  }

  private getCandidateOrder(
    posts: Post[],
    targets: Targets,
    counts: { l: number; mx: number; my: number; s: number },
    lCountInBand: number,
    mxCountInBand: number,
    myCountInBand: number,
    rowInBand: number
  ): CardType[] {
    const totalRemaining = posts.length;
    const remaining = {
      l: Math.max(0, targets.l - counts.l),
      mx: Math.max(0, targets.mx - counts.mx),
      my: Math.max(0, targets.my - counts.my),
      s: Math.max(0, targets.s - counts.s)
    };

    const currentPost = posts[0];

    if (currentPost.type === 'blog') return ['L'];

    const allowL = false;
    const allowM = remaining.mx > 0 || remaining.my > 0 || currentPost.contentLength > this.config.mediumContentLength;
    const holdSForL = allowL && rowInBand < 2;
    const shouldForceMX = mxCountInBand === 0;
    const shouldForceMY = myCountInBand === 0 && rowInBand === 0;

    const weighted: { type: CardType; weight: number }[] = [];

    if (allowL) weighted.push({ type: 'L', weight: remaining.l / totalRemaining });
    if (allowM && remaining.mx > 0 && mxCountInBand < 2) {
      weighted.push({ type: 'MX', weight: remaining.mx / totalRemaining });
    }
    if (allowM && remaining.my > 0 && myCountInBand < 2) {
      weighted.push({ type: 'MY', weight: remaining.my / totalRemaining });
    }
    if (remaining.s > 0 && !holdSForL && !shouldForceMX && !shouldForceMY) {
      weighted.push({ type: 'S', weight: remaining.s / totalRemaining });
    }

    weighted.sort((a, b) => b.weight - a.weight);
    const ordered = weighted.map(w => w.type);

    if (shouldForceMY && !ordered.includes('MY')) ordered.unshift('MY');
    if (shouldForceMX && !ordered.includes('MX')) ordered.unshift('MX');
    const fallback: CardType[] = holdSForL || shouldForceMX || shouldForceMY
      ? ['MX', 'MY', 'L', 'S']
      : ['S', 'MX', 'MY', 'L'];

    for (const t of fallback) {
      if (!ordered.includes(t)) ordered.push(t);
    }

    return ordered;
  }

  private findLPlacementInBand(
    remainingPosts: Post[],
    bandStartRow: number,
    band4: number,
    lastLMaxBand: number,
    lastLCols: number[],
    cardCounter: number
  ): { cardCounter: number; lastLMaxBand: number; lastLCols: number[]; filledCells: number } | null {
    if (band4 <= lastLMaxBand + this.config.lBandGap) return null;
    const { w, h } = this.getCardDimensions('L');
    const bandEndRow = bandStartRow + this.config.bandSize - 1;
    const candidates: Array<{ row: number; col: number }> = [];

    for (let r = bandStartRow; r <= bandEndRow - (h - 1); r++) {
      if (h > 1 && r % this.config.bandSize !== 0) continue;
      for (let c = 0; c <= this.config.gridCols - w; c++) {
        if (!this.canPlaceAt(r, c, w, h)) continue;
        if (this.isAdjacentToType(r, c, w, h, 'L')) continue;
        if (lastLCols.length >= 2 && lastLCols[0] === c && lastLCols[1] === c) continue;
        candidates.push({ row: r, col: c });
      }
    }
    if (candidates.length === 0) return null;
    const pick = bandStartRow === 0
      ? candidates[0]
      : candidates[Math.floor(this.random() * candidates.length)];
    const post = this.takePostForType(remainingPosts, 'L');
    if (!post) return null;
    this.placeCard(post, pick.row, pick.col, w, h, 'L', cardCounter++);
    const endBand4 = Math.floor((pick.row + h - 1) / this.config.bandSize);
    return {
      cardCounter,
      lastLMaxBand: endBand4,
      lastLCols: [...lastLCols, pick.col].slice(-2),
      filledCells: w * h
    };
  }

  private findPlacementInBand(
    remainingPosts: Post[],
    bandStartRow: number,
    type: 'MX' | 'MY',
    cardCounter: number
  ): { cardCounter: number; filledCells: number } | null {
    const { w, h } = this.getCardDimensions(type);
    const bandEndRow = bandStartRow + this.config.bandSize - 1;
    const candidates: Array<{ row: number; col: number }> = [];

    for (let r = bandStartRow; r <= bandEndRow - (h - 1); r++) {
      if (h > 1 && r % this.config.bandSize !== 0) continue;
      for (let c = 0; c <= this.config.gridCols - w; c++) {
        if (!this.canPlaceAt(r, c, w, h)) continue;
        if (type === 'MX' && this.isAdjacentToType(r, c, w, h, 'MY')) continue;
        if (type === 'MY' && this.isAdjacentToType(r, c, w, h, 'MX')) continue;
        if (type === 'MX' && this.isHorizontallyAdjacentMX(r, c, w)) continue;
        if (type === 'MX' && this.wouldCreateMediumChain(r, c, w, h, 'MX')) continue;
        if (type === 'MY' && this.wouldCreateMediumChain(r, c, w, h, 'MY')) continue;
        candidates.push({ row: r, col: c });
      }
    }
    if (candidates.length === 0) return null;
    const pick = bandStartRow === 0
      ? candidates[0]
      : candidates[Math.floor(this.random() * candidates.length)];
    const post = this.takePostForType(remainingPosts, type);
    if (!post) return null;
    this.placeCard(post, pick.row, pick.col, w, h, type, cardCounter++);
    return { cardCounter, filledCells: w * h };
  }

  private trimGrid(): void {
    const lastRowWithContent = this.grid.findLastIndex(rowCells =>
      rowCells.some(cell => cell !== null && cell !== 'EMPTY')
    );

    if (lastRowWithContent >= 0) {
      this.grid = this.grid.slice(0, lastRowWithContent + 1);
    }
  }

  generate(): LayoutResult | null {
    this.placements = [];
    this.grid = [];

    const remainingPosts = [...this.posts];
    const targets = this.computeTargets(remainingPosts);
    const counts = { l: 0, mx: 0, my: 0, s: 0 };

    const lCountInBand = new Map<number, number>();
    const mxCountInBand = new Map<number, number>();
    const myCountInBand = new Map<number, number>();

    const emptyCountInBand6 = new Map<number, number>();
    const emptyPerCol = Array(this.config.gridCols).fill(0);
    let emptyCount = 0;
    let filledCells = 0;

    const lastLCols: number[] = [];
    let lastLMaxBand = -999;

    let row = 0;
    let col = 0;
    let cardCounter = 0;

    while (remainingPosts.length > 0) {
      if (row >= this.grid.length) {
        this.grid.push(Array(this.config.gridCols).fill(null));
      }

      if (col === 0 && row % this.config.bandSize === 0) {
        const band4 = Math.floor(row / this.config.bandSize);
        const nextPost = remainingPosts[0];

        if (nextPost?.type === 'blog' && (lCountInBand.get(band4) || 0) === 0) {
          const forced = this.findLPlacementInBand(
            remainingPosts,
            row,
            band4,
            lastLMaxBand,
            lastLCols,
            cardCounter
          );

          if (forced) {
            cardCounter = forced.cardCounter;
            counts.l++;
            filledCells += forced.filledCells;
            lastLMaxBand = forced.lastLMaxBand;
            lastLCols.splice(0, lastLCols.length, ...forced.lastLCols);
            lCountInBand.set(band4, 1);
          }
        }

        if ((mxCountInBand.get(band4) || 0) === 0) {
          const forcedMX = this.findPlacementInBand(remainingPosts, row, 'MX', cardCounter);
          if (forcedMX) {
            cardCounter = forcedMX.cardCounter;
            filledCells += forcedMX.filledCells;
            mxCountInBand.set(band4, 1);
            counts.mx++;
          }
        }

        if ((myCountInBand.get(band4) || 0) === 0) {
          const forcedMY = this.findPlacementInBand(remainingPosts, row, 'MY', cardCounter);
          if (forcedMY) {
            cardCounter = forcedMY.cardCounter;
            filledCells += forcedMY.filledCells;
            myCountInBand.set(band4, 1);
            counts.my++;
          }
        }
      }

      if (remainingPosts.length === 0) break;

      if (this.grid[row][col] !== null) {
        col++;
        if (col >= this.config.gridCols) {
          col = 0;
          row++;
        }
        continue;
      }

      const band4 = Math.floor(row / this.config.bandSize);
      const band6 = Math.floor(row / this.config.emptyBand);

      if (
        this.shouldPlaceEmpty(
          row,
          col,
          this.grid.length,
          emptyCount,
          emptyCountInBand6,
          emptyPerCol,
          filledCells,
          targets,
          counts,
          remainingPosts.length
        )
      ) {
        if (this.canPlaceEmpty(row, col)) {
          this.grid[row][col] = 'EMPTY';
          emptyCount++;
          emptyPerCol[col]++;
          emptyCountInBand6.set(band6, (emptyCountInBand6.get(band6) || 0) + 1);
          col++;
          if (col >= this.config.gridCols) {
            col = 0;
            row++;
          }
          continue;
        }
      }

      const candidates = this.getCandidateOrder(
        remainingPosts,
        targets,
        counts,
        lCountInBand.get(band4) || 0,
        mxCountInBand.get(band4) || 0,
        myCountInBand.get(band4) || 0,
        row % this.config.bandSize
      );

      let placed = false;

      for (const type of candidates) {
        const { w, h } = this.getCardDimensions(type);
        const endBand4 = Math.floor((row + h - 1) / this.config.bandSize);

        if (h > 1 && row % this.config.bandSize !== 0) continue;
        if (!this.canPlaceAt(row, col, w, h)) continue;
        if (type === 'L' && (lCountInBand.get(band4) || 0) >= 1) continue;
        if (type === 'L' && band4 <= lastLMaxBand + this.config.lBandGap) continue;
        if (type === 'L' && this.isAdjacentToType(row, col, w, h, 'L')) continue;
        if (type === 'L' && lastLCols.length >= 2 && lastLCols[0] === col && lastLCols[1] === col) continue;
        if (type === 'MX' && this.isAdjacentToType(row, col, w, h, 'MY')) continue;
        if (type === 'MX' && this.isHorizontallyAdjacentMX(row, col, w)) continue;
        if (type === 'MY' && this.isAdjacentToType(row, col, w, h, 'MX')) continue;
        if (type === 'MX' && (mxCountInBand.get(band4) || 0) >= 2) continue;
        if (type === 'MY' && (myCountInBand.get(band4) || 0) >= 2) continue;
        if (type === 'MX' && this.wouldCreateMediumChain(row, col, w, h, 'MX')) continue;
        if (type === 'MY' && this.wouldCreateMediumChain(row, col, w, h, 'MY')) continue;
        if (type === 'S' && this.wouldCreateLargeSBlock(row, col, w, h)) continue;
        if (type === 'S' && this.wouldCreateFullSRow(row, col, w, h)) continue;

        const post = this.takePostForType(remainingPosts, type);
        if (!post) continue;
        this.placeCard(post, row, col, w, h, type, cardCounter++);
        filledCells += w * h;

        if (type === 'L') {
          for (let b = band4; b <= endBand4; b++) {
            lCountInBand.set(b, (lCountInBand.get(b) || 0) + 1);
          }
          counts.l++;
          lastLCols.push(col);
          if (lastLCols.length > 2) lastLCols.shift();
          lastLMaxBand = endBand4;
        } else if (type === 'MX') {
          mxCountInBand.set(band4, (mxCountInBand.get(band4) || 0) + 1);
          counts.mx++;
        } else if (type === 'MY') {
          myCountInBand.set(band4, (myCountInBand.get(band4) || 0) + 1);
          counts.my++;
        } else {
          counts.s++;
        }

        col += w;
        placed = true;
        break;
      }

      if (!placed) {
        const requiredEmpty = this.getRequiredEmpty(filledCells, emptyCount, targets, counts, remainingPosts.length);
        const canPlaceS = this.canPlaceAt(row, col, 1, 1);
        const needsMoreEmpty = emptyCount < requiredEmpty;
        const currentPost = remainingPosts[0];
        const mxMissing = (mxCountInBand.get(band4) || 0) < 1;
        const myMissing = (myCountInBand.get(band4) || 0) < 1;

        if (currentPost?.type === 'blog') {
          if (this.canPlaceEmpty(row, col) && emptyCount < requiredEmpty) {
            this.grid[row][col] = 'EMPTY';
            emptyCount++;
            emptyPerCol[col]++;
            emptyCountInBand6.set(band6, (emptyCountInBand6.get(band6) || 0) + 1);
          }
          col++;
          continue;
        }

        if (!needsMoreEmpty && canPlaceS && !(mxMissing || myMissing)) {
          const post = this.takePostForType(remainingPosts, 'S');
          if (!post) {
            col++;
            continue;
          }

          this.placeCard(post, row, col, 1, 1, 'S', cardCounter++);
          counts.s++;
          filledCells += 1;
          col += 1;
          placed = true;
        } else if (this.canPlaceEmpty(row, col) && emptyCount < requiredEmpty) {
          this.grid[row][col] = 'EMPTY';
          emptyCount++;
          emptyPerCol[col]++;
          emptyCountInBand6.set(band6, (emptyCountInBand6.get(band6) || 0) + 1);
          col++;
        } else {
          col++;
        }
      }

      if (col >= this.config.gridCols) {
        col = 0;
        row++;
      }
    }

    this.trimGrid();

    return {
      cols: 8,
      rows: this.grid.length,
      placements: this.placements
    };
  }
}

export function generateLayout(
  posts: Post[],
  seedOrOptions?: number | LayoutEngineOptions,
  config?: Partial<LayoutConfig>
): LayoutResult | null {
  const options: LayoutEngineOptions =
    typeof seedOrOptions === 'number'
      ? { seed: seedOrOptions, config }
      : seedOrOptions ?? {};
  const engine = new LayoutEngine(posts, options);

  return engine.generate();
}

export type { CardType, LayoutConfig, LayoutResult, Placement, Post };
