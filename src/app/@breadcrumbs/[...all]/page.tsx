import Link from "next/link";

import { getCrumbs } from "@/app/lib/breadcrumbs";
import { cn } from "@/app/lib/cn";

type Props = {
  params: Promise<{
    all: string[];
  }>;
};

const Page = async ({ params }: Props) => {
  const breadcrumbs = getCrumbs((await params).all);

  return (
    <header className={cn("flex justify-start p-6 font-bold text-black")}>
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className={cn("not-last:after:content-['/'] after:mx-2")}>
          <Link
            href={{ pathname: crumb.href }}
            className={cn(
              index !== breadcrumbs.length - 1
                ? "hover:text-blue-500 hover:underline hover:underline-offset-8"
                : ""
            )}
          >
            {crumb.text.toUpperCase()}
          </Link>
        </div>
      ))}
    </header>
  );
};

export default Page;
