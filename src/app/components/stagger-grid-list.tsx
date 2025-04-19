"use client";

import { animate, createScope, Scope, stagger } from "animejs";
import { useEffect, useRef } from "react";

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

export const StaggerGridList = ({ children, count }: Props) => {
  const root = useRef(null);
  const scope = useRef<Scope | null>(null);

  useEffect(() => {
    if (!root.current) return;

    const squares = (root.current as HTMLElement).querySelectorAll(".square");

    if (squares.length === 0) return;

    const { width } = getViewportSize();
    const columns = getColumns(width);

    scope.current = createScope({ root: root.current }).add(() => {
      animate(squares, {
        scale: [{ to: [0, 1.1] }, { to: 1 }],
        boxShadow: [
          { to: "0 0 1rem 0 rgba(0, 0, 0, 0.3)" },
          { to: "0 0 0rem 0 rgba(0, 0, 0, 0.3)" },
        ],
        delay: stagger(200, {
          grid: [columns, Math.ceil(count / columns)],
        }),
      });
    });

    return () => scope.current?.revert();
  }, [count]);

  return (
    <ul
      ref={root}
      className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5 xl:gap-5 2xl:grid-cols-6"
    >
      {children}
    </ul>
  );
};
