const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const JONGSEONG_COUNT = 28;
const CHOSEONG_BLOCK = 588;

const CHOSEONGS = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
] as const;

const CHOSEONG_SET = new Set<string>(CHOSEONGS);
const BOUNDARIES = new Set([' ', '/', '-', '_', '.', ':', '[', ']', '(', ')']);

export type FuzzyMatch = {
  indexes: number[];
  score: number;
};

const isHangulSyllable = (char: string): boolean => {
  const code = char.charCodeAt(0);

  return HANGUL_BASE <= code && code <= HANGUL_END;
};

const isChoseong = (char: string): boolean => CHOSEONG_SET.has(char);

const isKorean = (char: string): boolean => isChoseong(char) || isHangulSyllable(char);

const getChoseong = (char: string): string => {
  if (isChoseong(char)) return char;
  if (!isHangulSyllable(char)) return char;

  const index = char.charCodeAt(0) - HANGUL_BASE;

  return CHOSEONGS[Math.floor(index / CHOSEONG_BLOCK)];
};

const omitFinal = (char: string): string => {
  if (!isHangulSyllable(char)) return char;

  const code = char.charCodeAt(0);
  const finalIndex = (code - HANGUL_BASE) % JONGSEONG_COUNT;

  return String.fromCharCode(code - finalIndex);
};

const isSimilarKorean = (queryChar: string, targetChar: string): boolean => {
  if (queryChar === targetChar) return true;
  if (!isKorean(queryChar) || !isKorean(targetChar)) return false;
  if (isChoseong(queryChar) || isChoseong(targetChar)) {
    return getChoseong(queryChar) === getChoseong(targetChar);
  }

  return omitFinal(queryChar) === omitFinal(targetChar);
};

const charScore = (queryChar: string, targetChar: string): number => {
  if (queryChar === targetChar) return 1;
  if (isSimilarKorean(queryChar, targetChar)) return 0.95;

  return 0;
};

const normalize = (value: string): string => value.normalize('NFC').toLowerCase();

const exactMatch = (query: string, target: string): FuzzyMatch | null => {
  const index = target.indexOf(query);

  if (index < 0) return null;

  return {
    indexes: Array.from({ length: Array.from(query).length }, (_, offset) => index + offset),
    score: 1,
  };
};

export const fuzzyMatch = (query: string, target: string): FuzzyMatch | null => {
  const q = normalize(query.trim());
  const text = normalize(target);

  if (!q || !text) return null;

  const exact = exactMatch(q, text);

  if (exact) return exact;

  const queryChars = Array.from(q);
  const targetChars = Array.from(text);

  let queryIndex = 0;
  let totalCharScore = 0;
  let contiguousPairs = 0;
  let previousMatchIndex = -1;
  const indexes: number[] = [];

  for (let i = 0; i < targetChars.length && queryIndex < queryChars.length; i++) {
    const score = charScore(queryChars[queryIndex], targetChars[i]);

    if (score === 0) continue;

    indexes.push(i);
    totalCharScore += score;

    if (previousMatchIndex === i - 1) contiguousPairs += 1;

    previousMatchIndex = i;
    queryIndex += 1;
  }

  if (queryIndex !== queryChars.length) return null;

  const first = indexes[0];
  const last = indexes[indexes.length - 1];
  const span = last - first + 1;
  const density = queryChars.length / span;
  const averageCharScore = totalCharScore / queryChars.length;
  const contiguousScore = queryChars.length > 1 ? contiguousPairs / (queryChars.length - 1) : 1;
  const boundaryScore = first === 0 || BOUNDARIES.has(targetChars[first - 1]) ? 1 : 0;
  const score = averageCharScore * 0.45 + density * 0.35 + contiguousScore * 0.15 + boundaryScore * 0.05;

  return { indexes, score: Math.min(score, 0.98) };
};
