"use client";

import Link, { LinkProps } from "next/link";

import { cn } from "../lib/cn";
import { useMounted } from "../lib/use-mounted";

type Props<RouteInferred> = {
  title: string;
  href: LinkProps<RouteInferred>["href"];
  excerpt: string;
};

const squareItemClass = cn("square absolute -left-0 -top-0 aspect-square w-1/2 overflow-auto bg-transparent p-2 opacity-0 will-change-transform md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6");
const linkClass = cn("group relative h-full w-full [transform-style:preserve-3d]");
const frontFaceClass = cn("size-full break-all border-2 border-black p-4 text-pretty text-lg transition-transform duration-[400ms] ease-[cubic-bezier(0,0.55,0.45,1)] will-change-transform [backface-visibility:hidden] md:text-xl lg:text-2xl");
const backFaceClass = cn("square-link-excerpt absolute -left-0 -top-0 size-full break-all border-2 border-black p-4 text-[10px] transition-transform duration-[400ms] ease-[cubic-bezier(0,0.55,0.45,1)] will-change-transform [backface-visibility:hidden] md:text-xs lg:text-sm");
const fallbackFaceClass = cn("size-full break-all border-2 border-black p-4 text-pretty text-lg transition-transform duration-[200ms] [backface-visibility:hidden] md:text-xl lg:text-2xl");

export const SquareLink = <RouteInferred,>({
  title,
  href,
  excerpt,
}: Props<RouteInferred>) => {
  const isMounted = useMounted();

  return (
    <li className={cn(squareItemClass)}>
      <Link href={href} className={cn(linkClass)}>
        {isMounted ? (
          <>
            <div className={cn(frontFaceClass, "flex items-center justify-center [transform:rotateY(0deg)] group-hover:[transform:rotateY(180deg)]")}>
              {title}
            </div>
            <div
              className={cn(backFaceClass, "[transform:rotateY(180deg)] group-hover:[transform:rotateY(0deg)]")}
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </>
        ) : (
          <div className={cn(fallbackFaceClass, "flex items-center")}>
            {title}
          </div>
        )}
      </Link>
    </li>
  );
};
