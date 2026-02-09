"use client";

import { useEffect, useRef, useState } from "react";
import { throttle } from 'es-toolkit/function';

import { cn } from "../lib/cn";

export const HomeHeader = () => {
  const [isStuck, setIsStuck] = useState(false);
  const headerRef = useRef<HTMLHeadElement>(null);

  useEffect(() => {
    const headerElement = headerRef.current;

    if (!headerElement) return;

    const update = () => setIsStuck(window.scrollY > 24);

    update();
		
    const throttledUpdate = throttle(update, 100);
    const onScroll = () => requestAnimationFrame(throttledUpdate);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header ref={headerRef} className={cn(
      "sticky top-0 z-20 mb-6 w-full noise-bg",
      "mx-auto flex w-full max-w-[980px] items-center justify-between px-4 py-3 backdrop-blur-sm ",
      "border border-[var(--color-grid-line)]/70 transition-[border-radius,border-color] duration-300 ease-out",
      isStuck ? "rounded-b-[var(--radius-card)] border-t-transparent" : "rounded-[var(--radius-card)]",
    )}>
      <div className={cn("text-xl font-bold tracking-tight text-[var(--color-grid-line)] md:text-2xl")}>
          cnst.
      </div>
    </header>
  );
};
