"use client";

import { animate, createScope, Scope, stagger, utils } from "animejs";
import { useEffect, useRef, useState } from "react";

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
        boxShadow: [
          { to: "0 0 1rem 0 rgba(0, 0, 0, 0.3)" },
          { to: "0 0 0rem 0 rgba(0, 0, 0, 0.3)" },
        ],
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
        animate(utils.shuffle([...squares]), { x, y });
      });
    });

    return () => scope.current?.revert();
  }, [count, itemSize]);

  const handleClick = () => {
    scope.current?.methods.shuffle();
  };

  return (
    <div>
      <button onClick={handleClick}>click</button>
      <ul ref={root} className="relative flex flex-wrap">
        {children}
      </ul>
    </div>
  );
};
