type CardType = 'S' | 'MX' | 'MY' | 'L';

interface Post {
  id: string;
  contentLength: number;
}

interface Placement {
  postId: string;
  row: number;
  col: number;
  w: number;
  h: number;
  type: CardType;
}

interface LayoutResult {
  cols: 8;
  rows: number;
  placements: Placement[];
  grid: (string | null)[][];
}

interface Targets {
  l: number;
  mx: number;
  my: number;
  s: number;
  minL: number;
  maxL: number;
  minS: number;
  minM: number;
  maxM: number;
}

const GRID_COLS = 8;
const BAND_SIZE = 2;
const EMPTY_BAND = 6;
const L_BAND_GAP = 0;

function getCardDimensions(type: CardType): { w: number; h: number } {
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeTargets(total: number): Targets {
  const minS = Math.ceil(total * 0.3);
  const minM = Math.ceil(total * 0.3);
  const maxM = Math.floor(total * 0.5);
  const minL = Math.ceil(total * 0.1);
  const maxL = Math.floor(total * 0.25);

  let targetL = clamp(Math.round(total * 0.15), minL, maxL);
  let targetM = clamp(Math.round(total * 0.5), minM, maxM);
  let targetS = total - targetL - targetM;

  while (targetS < minS && targetM > minM) {
    targetM--;
    targetS++;
  }
  while (targetS < minS && targetL > minL) {
    targetL--;
    targetS++;
  }

  const targetMX = Math.max(0, Math.round(targetM * 0.75));
  const targetMY = Math.max(0, targetM - targetMX);

  return {
    l: targetL,
    mx: targetMX,
    my: targetMY,
    s: targetS,
    minL,
    maxL,
    minS,
    minM,
    maxM
  };
}

function generateLayout(posts: Post[]): LayoutResult {
  const placements: Placement[] = [];
  const grid: (string | null)[][] = [];
  const remainingPosts = [...posts];
  const targets = computeTargets(posts.length);

  const counts = { l: 0, mx: 0, my: 0, s: 0 };
  const lCountInBand = new Map<number, number>();
  const mxCountInBand = new Map<number, number>();
  const myCountInBand = new Map<number, number>();

  const emptyCountInBand6 = new Map<number, number>();
  const emptyPerCol = Array(GRID_COLS).fill(0);
  let emptyCount = 0;

  const lastLCols: number[] = [];
  let lastLMaxBand = -999;

  let row = 0;
  let col = 0;
  let cardCounter = 0;
  let filledCells = 0;

  while (remainingPosts.length > 0) {
    if (row >= grid.length) {
      grid.push(Array(GRID_COLS).fill(null));
    }

    if (col === 0 && row % BAND_SIZE === 0) {
      const band4 = Math.floor(row / BAND_SIZE);
      const remainingL = Math.max(0, targets.l - counts.l);
      if (remainingL > 0 && (lCountInBand.get(band4) || 0) === 0) {
        const forced = findLPlacementInBand(
          grid,
          placements,
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
    }

    if (remainingPosts.length === 0) break;

    if (grid[row][col] !== null) {
      col++;
      if (col >= GRID_COLS) {
        col = 0;
        row++;
      }
      continue;
    }

    const band4 = Math.floor(row / BAND_SIZE);
    const band6 = Math.floor(row / EMPTY_BAND);

    if (
      shouldPlaceEmpty(
        row,
        col,
        grid.length,
        emptyCount,
        emptyCountInBand6,
        emptyPerCol,
        filledCells,
        targets,
        counts,
        remainingPosts.length
      )
    ) {
      if (canPlaceEmpty(grid, row, col)) {
        grid[row][col] = 'EMPTY';
        emptyCount++;
        emptyPerCol[col]++;
        emptyCountInBand6.set(band6, (emptyCountInBand6.get(band6) || 0) + 1);
        col++;
        if (col >= GRID_COLS) {
          col = 0;
          row++;
        }
        continue;
      }
    }

    const candidates = getCandidateOrder(
      remainingPosts,
      targets,
      counts,
      lCountInBand.get(band4) || 0,
      mxCountInBand.get(band4) || 0,
      myCountInBand.get(band4) || 0,
      row % BAND_SIZE
    );

    let placed = false;
    for (const type of candidates) {
      const { w, h } = getCardDimensions(type);
      const endBand4 = Math.floor((row + h - 1) / BAND_SIZE);
      if (!canPlaceAt(grid, row, col, w, h)) continue;
      if (type === 'L' && (lCountInBand.get(band4) || 0) >= 1) continue;
      if (type === 'L' && band4 <= lastLMaxBand + L_BAND_GAP) continue;
      if (type === 'L' && isAdjacentToType(placements, row, col, w, h, 'L')) continue;
      if (type === 'L' && lastLCols.length >= 2 && lastLCols[0] === col && lastLCols[1] === col) continue;
      if (type === 'MX' && isAdjacentToType(placements, row, col, w, h, 'MY')) continue;
      if (type === 'MY' && isAdjacentToType(placements, row, col, w, h, 'MX')) continue;
      if (type === 'MX' && (mxCountInBand.get(band4) || 0) >= 2) continue;
      if (type === 'MY' && (myCountInBand.get(band4) || 0) >= 2) continue;
      if (type === 'MX' && wouldCreateMediumChain(placements, row, col, w, h, 'MX')) continue;
      if (type === 'MY' && wouldCreateMediumChain(placements, row, col, w, h, 'MY')) continue;
      if (type === 'S' && wouldCreateLargeSBlock(grid, row, col, w, h)) continue;
      if (type === 'S' && wouldCreateFullSRow(grid, row, col, w, h)) continue;

      const post = remainingPosts.shift()!;
      placeCard(grid, placements, post, row, col, w, h, type, cardCounter++);
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
      const requiredEmpty = getRequiredEmpty(filledCells, emptyCount, targets, counts, remainingPosts.length);
      const canPlaceS = canPlaceAt(grid, row, col, 1, 1);
      const needsMoreEmpty = emptyCount < requiredEmpty;

      if (!needsMoreEmpty && canPlaceS) {
        const post = remainingPosts.shift()!;
        placeCard(grid, placements, post, row, col, 1, 1, 'S', cardCounter++);
        counts.s++;
        filledCells += 1;
        col += 1;
        placed = true;
      } else if (canPlaceEmpty(grid, row, col) && (emptyCount < requiredEmpty)) {
        grid[row][col] = 'EMPTY';
        emptyCount++;
        emptyPerCol[col]++;
        emptyCountInBand6.set(band6, (emptyCountInBand6.get(band6) || 0) + 1);
        col++;
      } else {
        col++;
      }
    }

    if (col >= GRID_COLS) {
      col = 0;
      row++;
    }
  }

  const lastRowWithContent = grid.findLastIndex(
    rowCells => rowCells.some(cell => cell !== null && cell !== 'EMPTY')
  );
  const trimmedGrid = lastRowWithContent >= 0 ? grid.slice(0, lastRowWithContent + 1) : grid;

  return {
    cols: 8,
    rows: trimmedGrid.length,
    placements,
    grid: trimmedGrid
  };
}

function getCandidateOrder(
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

  const post = posts[0];
  const requiredL = Math.max(0, targets.minL - counts.l);
  if (totalRemaining <= requiredL) return ['L', 'S', 'MX', 'MY'];

  const allowL = lCountInBand === 0 && remaining.l > 0;
  const allowM = remaining.mx > 0 || remaining.my > 0 || post.contentLength > 700;
  const holdSForL = allowL && rowInBand < 2;

  const weighted: { type: CardType; weight: number }[] = [];
  if (allowL) weighted.push({ type: 'L', weight: remaining.l / totalRemaining });
  if (allowM && remaining.mx > 0 && mxCountInBand < 2) weighted.push({ type: 'MX', weight: remaining.mx / totalRemaining });
  if (allowM && remaining.my > 0 && myCountInBand < 2) weighted.push({ type: 'MY', weight: remaining.my / totalRemaining });
  if (remaining.s > 0 && !holdSForL) weighted.push({ type: 'S', weight: remaining.s / totalRemaining });

  weighted.sort((a, b) => b.weight - a.weight);
  const ordered = weighted.map(w => w.type);
  const fallback: CardType[] = holdSForL ? ['MX', 'MY', 'L', 'S'] : ['S', 'MX', 'MY', 'L'];
  for (const t of fallback) {
    if (!ordered.includes(t)) ordered.push(t);
  }

  return ordered;
}

function shouldPlaceEmpty(
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
  const band6 = Math.floor(row / EMPTY_BAND);
  const emptyInBand = emptyCountInBand6.get(band6) || 0;
  const isLastRowInBand = row % EMPTY_BAND === EMPTY_BAND - 1;
  const requiredEmpty = getRequiredEmpty(filledCells, emptyCount, targets, counts, remainingPosts);

  const totalCells = Math.max(1, currentRows * GRID_COLS);
  const emptyRatio = emptyCount / totalCells;
  const colLimit = Math.floor(currentRows * 0.4);

  if (emptyPerCol[col] + 1 > colLimit) return false;
  if (isLastRowInBand && emptyInBand === 0) return true;
  if (emptyCount < requiredEmpty) return Math.random() < 0.12;
  return false;
}

function getRequiredEmpty(
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

function canPlaceEmpty(grid: (string | null)[][], row: number, col: number): boolean {
  if (grid[row][col] !== null) return false;
  const clusterSize = getEmptyClusterSize(grid, row, col);
  return clusterSize <= 4;
}

function getEmptyClusterSize(grid: (string | null)[][], row: number, col: number): number {
  const visited = new Set<string>();
  const queue: [number, number][] = [[row, col]];
  let size = 0;

  while (queue.length > 0 && size <= 4) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    size++;

    const neighbors: [number, number][] = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1]
    ];

    for (const [nr, nc] of neighbors) {
      if (nr < 0 || nc < 0 || nr >= grid.length || nc >= GRID_COLS) continue;
      const cell = grid[nr][nc];
      if (cell === 'EMPTY' && !visited.has(`${nr},${nc}`)) queue.push([nr, nc]);
    }
  }

  return size;
}

function canPlaceAt(grid: (string | null)[][], row: number, col: number, w: number, h: number): boolean {
  if (col + w > GRID_COLS) return false;
  for (let r = row; r < row + h; r++) {
    if (r >= grid.length) continue;
    for (let c = col; c < col + w; c++) {
      if (grid[r][c] !== null) return false;
    }
  }
  return true;
}

function isAdjacentToType(
  placements: Placement[],
  row: number,
  col: number,
  w: number,
  h: number,
  type: CardType
): boolean {
  const rect = { row, col, w, h };
  for (const p of placements) {
    if (p.type !== type) continue;
    if (isOrthogonallyAdjacent(rect, p)) return true;
  }
  return false;
}

function isOrthogonallyAdjacent(
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

function wouldCreateMediumChain(
  placements: Placement[],
  row: number,
  col: number,
  w: number,
  h: number,
  type: CardType
): boolean {
  const newPlacement: Placement = { postId: '__new__', row, col, w, h, type };
  const nodes = placements.filter(p => p.type === type).concat(newPlacement);
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
        if (isOrthogonallyAdjacent(current, other)) {
          visited.add(other);
          queue.push(other);
        }
      }
    }

    if (component.length > 2) return true;
  }

  return false;
}

function wouldCreateLargeSBlock(
  grid: (string | null)[][],
  row: number,
  col: number,
  w: number,
  h: number
): boolean {
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
        if (r + ch > grid.length) continue;
        if (c + cw > GRID_COLS) continue;
        if (isAllS(grid, r, c, cw, ch, row, col, w, h)) return true;
      }
    }
  }

  return false;
}

function isAllS(
  grid: (string | null)[][],
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
      const cell = grid[r][c];
      if (!cell || !cell.startsWith('S_')) return false;
    }
  }
  return true;
}

function wouldCreateFullSRow(
  grid: (string | null)[][],
  row: number,
  col: number,
  w: number,
  h: number
): boolean {
  const rowsToCheck = [row, row + 1];
  for (const r of rowsToCheck) {
    if (r < 0) continue;
    if (r >= grid.length) continue;
    let allS = true;
    for (let c = 0; c < GRID_COLS; c++) {
      const inNew = r >= row && r < row + h && c >= col && c < col + w;
      if (inNew) continue;
      const cell = grid[r][c];
      if (!cell || !cell.startsWith('S_')) {
        allS = false;
        break;
      }
    }
    if (allS) return true;
  }

  return false;
}

function placeCard(
  grid: (string | null)[][],
  placements: Placement[],
  post: Post,
  row: number,
  col: number,
  w: number,
  h: number,
  type: CardType,
  id: number
): void {
  const cardId = `${type}_${id}`;
  for (let r = row; r < row + h; r++) {
    if (r >= grid.length) {
      grid.push(Array(GRID_COLS).fill(null));
    }
    for (let c = col; c < col + w; c++) {
      grid[r][c] = cardId;
    }
  }

  placements.push({
    postId: post.id,
    row,
    col,
    w,
    h,
    type
  });
}

function findLPlacementInBand(
  grid: (string | null)[][],
  placements: Placement[],
  remainingPosts: Post[],
  bandStartRow: number,
  band4: number,
  lastLMaxBand: number,
  lastLCols: number[],
  cardCounter: number
): { cardCounter: number; lastLMaxBand: number; lastLCols: number[]; filledCells: number } | null {
  if (band4 <= lastLMaxBand + L_BAND_GAP) return null;
  const { w, h } = getCardDimensions('L');
  const bandEndRow = bandStartRow + BAND_SIZE - 1;

  for (let r = bandStartRow; r <= bandEndRow - (h - 1); r++) {
    for (let c = 0; c <= GRID_COLS - w; c++) {
      if (!canPlaceAt(grid, r, c, w, h)) continue;
      if (isAdjacentToType(placements, r, c, w, h, 'L')) continue;
      if (lastLCols.length >= 2 && lastLCols[0] === c && lastLCols[1] === c) continue;

      const post = remainingPosts.shift();
      if (!post) return null;
      placeCard(grid, placements, post, r, c, w, h, 'L', cardCounter++);
      const endBand4 = Math.floor((r + h - 1) / BAND_SIZE);
      return {
        cardCounter,
        lastLMaxBand: endBand4,
        lastLCols: [...lastLCols, c].slice(-2),
        filledCells: w * h
      };
    }
  }

  return null;
}

function printGrid(result: LayoutResult): void {
  console.log('\n=== Grid Layout (Initials per cell) ===');
  console.log('S=S:1x1, M=MX:2x1, V=MY:1x2, L=L:2x2, .=empty\n');

  for (let r = 0; r < result.grid.length; r++) {
    let line = `Row ${String(r).padStart(2)}: `;
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = result.grid[r][c];
      if (cell === null || cell === 'EMPTY') {
        line += '.';
      } else {
        const type = cell.split('_')[0] as CardType;
        line += type === 'MX' ? 'M' : type === 'MY' ? 'V' : type;
      }
    }
    console.log(line);
  }

  console.log('\n=== Statistics ===');
  const counts: Record<CardType, number> = { S: 0, MX: 0, MY: 0, L: 0 };
  for (const placement of result.placements) {
    counts[placement.type]++;
  }
  const total = result.placements.length;
  const emptyCells = result.grid.flat().filter(c => c === null || c === 'EMPTY').length;
  const totalCells = result.grid.length * GRID_COLS;

  console.log(`S (1x1): ${counts.S} (${((counts.S / total) * 100).toFixed(1)}%)`);
  console.log(`MX (2x1): ${counts.MX} (${((counts.MX / total) * 100).toFixed(1)}%)`);
  console.log(`MY (1x2): ${counts.MY} (${((counts.MY / total) * 100).toFixed(1)}%)`);
  console.log(`L (2x2): ${counts.L} (${((counts.L / total) * 100).toFixed(1)}%)`);
  console.log(`Total cards: ${total}`);
  console.log(`Empty cells: ${emptyCells} (${((emptyCells / totalCells) * 100).toFixed(1)}%)`);
  console.log(`Total rows: ${result.grid.length}`);
}

function generateTestPosts(count: number): Post[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `post-${i + 1}`,
    contentLength: Math.random() > 0.7 ? 2500 : Math.random() > 0.4 ? 1200 : 400
  }));
}

const testPosts = generateTestPosts(100);
console.log(`Generating layout for ${testPosts.length} posts...`);
const result = generateLayout(testPosts);
printGrid(result);
