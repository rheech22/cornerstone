"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createScope, Scope, stagger, utils } from "animejs";

type Props = {
  children: React.ReactNode;
  count: number;
};

const getViewportSize = () => {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  const { innerWidth: width, innerHeight: height } = window;

  return { width, height };
};

const getColumns = (width: number) => {
  if (width <= 768) return 2;
  if (width <= 1024) return 3;
  if (width <= 1280) return 4;
  if (width <= 1536) return 5;

  return 6;
};

const getGrid = (count: number) => {
  const { width } = getViewportSize();
  const columns = getColumns(width);
  const rows = Math.ceil(count / columns);

  return [columns, rows];
};

export const StaggerGridList = ({ children, count }: Props) => {
  const root = useRef(null);
  const scope = useRef<Scope | null>(null);
  const [itemSize, setItemSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const initializeItemSize = () => {
      if (!root.current) return;
      const square = (root.current as HTMLElement).querySelector(".square");

      if (!square) return;
      setItemSize({ width: square.clientWidth, height: square.clientHeight });
    };

    initializeItemSize();

    window.addEventListener("resize", initializeItemSize);

    return () => {
      window.removeEventListener("resize", initializeItemSize);
      scope.current?.revert();
    };
  }, []);

  useEffect(() => {
    if (!root.current) return;
    const squares = (root.current as HTMLElement).querySelectorAll(".square");

    if (squares.length === 0) return;

    const grid = getGrid(count);

    scope.current = createScope({ root: root.current }).add(() => {
      animate(squares, {
        scale: [0.8, 1],
        opacity: [0, 1],
        delay: stagger(100, { grid }),
      });
    });

    return () => scope.current?.revert();
  }, [count]);

  useEffect(() => {
    if (!root.current) return;
    const squares = (root.current as HTMLElement).querySelectorAll(".square");

    if (squares.length === 0) return;

    const grid = getGrid(count);

    scope.current = createScope({ root: root.current }).add((thisScope) => {
      const x = stagger(itemSize.width, {
        grid,
        axis: "x",
      });
      const y = stagger(itemSize.height, {
        grid,
        axis: "y",
      });

      utils.set(squares, { x, y });
      thisScope.add("shuffle", () => {
        animate(utils.shuffle([...squares]), {
          x,
          y,
          ease: "inOutCirc",
        });
      });
    });

    return () => scope.current?.revert();
  }, [count, itemSize]);

  const handleClick = () => {
    scope.current?.methods.shuffle();
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={handleClick}
        className="flex items-center justify-start border-2 border-black p-1 text-sm ml-2 w-7 h-7 overflow-hidden hover:w-20 transition-all ease-[cubic-bezier(0.95,0.05,0.795,0.035)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1 shrink-0"
        >
          <path d="m18 14 4 4-4 4" />
          <path d="m18 2 4 4-4 4" />
          <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
          <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
          <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
        </svg>
        shuffle!
      </button>
      <ul ref={root} className="relative flex flex-wrap">
        {children}
      </ul>
    </div>
  );
};
