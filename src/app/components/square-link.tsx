"use client";

import Link, { LinkProps } from "next/link";
import { useState, useEffect } from "react";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <li className="border-2 border-black w-full aspect-square">
      <Link
        href={href}
        className="group w-full h-full flex flex-col items-center justify-center"
      >
        {isMounted ? (
          <>
            <span className="text-pretty text-center text-lg md:text-xl lg:text-2xl group-hover:hidden break-all p-4">
              {title}
            </span>
            <div
              className="square-link-excerpt w-full text-[10px] md:text-xs lg:text-sm hidden group-hover:block p-4"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </>
        ) : (
          <span className="text-pretty text-center text-lg md:text-xl lg:text-2xl group-hover:hidden break-all p-4">
            {title}
          </span>
        )}
      </Link>
    </li>
  );
};
