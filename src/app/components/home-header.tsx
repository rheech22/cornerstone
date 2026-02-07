"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "../lib/cn";

export const HomeHeader = () => {
  const [isStuck, setIsStuck] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const headerElement = headerRef.current;

    if (!headerElement) return;

    let stickyStartY = 0;

    const measureStickyStart = () => {
      const rect = headerElement.getBoundingClientRect();

      stickyStartY = rect.top + window.scrollY;
    };

    const onScroll = () => {
      setIsStuck(window.scrollY >= stickyStartY);
    };

    const onResize = () => {
      measureStickyStart();
      onScroll();
    };

    measureStickyStart();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <header ref={headerRef} className={cn("sticky top-0 z-20 mb-6 w-full")}>
      <div
        className={cn(
          "mx-auto flex w-full max-w-[980px] items-center justify-between bg-[color-mix(in_srgb,var(--color-grid-surface)_82%,transparent)] px-4 py-3 backdrop-blur-sm ",
          "border border-[var(--color-grid-line)]/70 transition-[border-radius,border-color] duration-300 ease-out",
          isStuck ? "rounded-b-[var(--radius-card)] border-t-transparent" : "rounded-[var(--radius-card)]",
        )}
      >
        <div className={cn("text-xl font-bold tracking-tight text-[var(--color-grid-line)] md:text-2xl")}>
          cnst.
        </div>
      </div>
    </header>
  );
};
