import Link from "next/link";

import { getCrumbs } from "@/app/lib/breadcrumbs";

type Props = {
  params: Promise<{
    all: string[];
  }>;
};

const Page = async ({ params }: Props) => {
  const breadcrumbs = getCrumbs((await params).all);

  return (
    <header className="flex justify-start text-black font-bold p-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="not-last:after:content-['/'] after:mx-2 ">
          <Link
            href={{ pathname: crumb.href }}
            className={
              index !== breadcrumbs.length - 1
                ? "hover:text-blue-500 hover:underline hover:underline-offset-8"
                : ""
            }
          >
            {crumb.text.toUpperCase()}
          </Link>
        </div>
      ))}
    </header>
  );
};

export default Page;
