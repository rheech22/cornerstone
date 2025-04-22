"use client";

import Link, { LinkProps } from "next/link";
import { useMounted } from "../lib/use-mounted";

type Props<RouteInferred> = {
  title: string;
  href: LinkProps<RouteInferred>["href"];
  excerpt: string;
};

export const SquareLink = <RouteInferred,>({
  title,
  href,
  excerpt,
}: Props<RouteInferred>) => {
  const isMounted = useMounted();

  return (
    <li className="square bg-transparent aspect-square overflow-auto w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 absolute -top-0 -left-0 p-2 opacity-0 will-change-transform">
      <Link href={href} className="group w-full h-full relative transform-3d">
        {isMounted ? (
          <>
            <div className="text-pretty text-lg md:text-xl lg:text-2xl flex items-center justify-center break-all p-4 size-full backface-hidden group-hover:rotate-y-180 transition-transform duration-400 border-2 border-black ease-[cubic-bezier(0, 0.55, 0.45, 1)] will-change-transform">
              {title}
            </div>
            <div
              className="square-link-excerpt size-full text-[10px] md:text-xs lg:text-sm p-4 backface-hidden rotate-y-180 group-hover:rotate-y-0 absolute -top-0 -left-0 transition-transform duration-400 border-2 border-black ease-[cubic-bezier(0, 0.55, 0.45, 1)] will-change-transform"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </>
        ) : (
          <div className="text-pretty text-lg md:text-xl lg:text-2xl flex items-center break-all p-4 size-full backface-hidden group-hover:rotate-y-180 transition-transform duration-200 border-2 border-black">
            {title}
          </div>
        )}
      </Link>
    </li>
  );
};
