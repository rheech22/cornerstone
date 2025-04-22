"use client";

import Link, { LinkProps } from "next/link";

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
  return (
    <li className="square bg-transparent aspect-square overflow-auto w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 absolute -top-0 -left-0 p-2">
      <Link
        href={href}
        className="group w-full h-full flex flex-col items-center justify-center border-2 border-black"
      >
        <>
          <span className="text-pretty text-center text-lg md:text-xl lg:text-2xl group-hover:hidden break-all p-4">
            {title}
          </span>
          <div
            className="square-link-excerpt w-full text-[10px] md:text-xs lg:text-sm hidden group-hover:block p-4"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        </>
      </Link>
    </li>
  );
};
