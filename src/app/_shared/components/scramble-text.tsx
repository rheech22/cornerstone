'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

type ScrambleTextProps = {
  text: string;
  active: boolean;
  highlightIndex?: number;
  highlightClassName?: string;
  playOnMount?: boolean;
};

const DEFAULT_SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
const STEP_MS = 100;
const MIN_DURATION_MS = 200;
const MAX_DURATION_MS = 700;

const getRandomChar = () => {
  const index = Math.floor(Math.random() * DEFAULT_SCRAMBLE_CHARS.length);

  return DEFAULT_SCRAMBLE_CHARS[index] ?? '';
};

const getDuration = (text: string) =>
  Math.min(Math.max(text.length * STEP_MS, MIN_DURATION_MS), MAX_DURATION_MS);

const scrambleFrom = (text: string, lockedCount: number) =>
  text.slice(0, lockedCount) +
  Array.from({ length: text.length - lockedCount }, getRandomChar).join('');

const getLockedCount = (text: string, progress: number) =>
  Math.min(Math.max(Math.ceil(text.length * progress), 1), text.length);

export const ScrambleText = ({
  text,
  active,
  highlightIndex = -1,
  highlightClassName = 'text-vague-amber',
  playOnMount = false,
}: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mountedText = useRef(text);
  const playedOnMount = useRef(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => setReducedMotion(media.matches);

    updateReducedMotion();
    media.addEventListener('change', updateReducedMotion);

    return () => media.removeEventListener('change', updateReducedMotion);
  }, []);

  useEffect(() => {
    if (mountedText.current !== text) {
      mountedText.current = text;
      playedOnMount.current = false;
    }

    const shouldPlayOnMount = playOnMount && !playedOnMount.current;
    const shouldAnimate = active || shouldPlayOnMount;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!shouldAnimate || reducedMotion || prefersReducedMotion || text.length === 0) {
      if (shouldPlayOnMount) playedOnMount.current = true;

      setDisplayText(text);

      return;
    }

    if (shouldPlayOnMount) playedOnMount.current = true;

    const duration = getDuration(text);
    const startedAt = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const lockedCount = getLockedCount(text, progress);

      if (progress >= 1) {
        setDisplayText(text);

        return;
      }

      setDisplayText(scrambleFrom(text, lockedCount));
      frameId = requestAnimationFrame(tick);
    };

    setDisplayText(scrambleFrom(text, 1));
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [active, playOnMount, reducedMotion, text]);

  return (
    <span aria-label={text}>
      {Array.from(displayText).map((char, index) => (
        <span key={index} aria-hidden="true" className={cn(index === highlightIndex && highlightClassName)}>
          {char}
        </span>
      ))}
    </span>
  );
};
