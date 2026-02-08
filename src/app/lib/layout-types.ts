export type CardType = 'S' | 'MX' | 'MY' | 'L';

export type Placement = {
  postId: string;
  row: number;
  col: number;
  w: number;
  h: number;
  type: CardType;
};

export type LayoutResult = {
  cols: number;
  rows: number;
  placements: Placement[];
};

export type Post = {
  id: string;
  title: string;
  created: string;
  updated: string;
  tags: string[];
  contentLength: number;
  type: 'blog' | 'note';
};

export type Targets = {
  l: number;
  mx: number;
  my: number;
  s: number;
  minL: number;
  maxL: number;
  minS: number;
  minM: number;
  maxM: number;
};

export type LayoutConfig = {
  gridCols: number;
  bandSize: number;
  emptyBand: number;
  lBandGap: number;
  targetM: number;
  targetMX: number;
  emptyProbability: number;
  mediumContentLength: number;
};
