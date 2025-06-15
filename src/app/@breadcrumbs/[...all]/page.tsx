import { getCrumbs } from "@/app/lib/breadcrumbs";
import Link from "next/link";

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
        <div key={index} className="not-last:after:content-['/'] after:mx-2">
          <Link href={{ pathname: crumb.href }}>
            {crumb.text.toUpperCase()}
          </Link>
        </div>
      ))}
    </header>
  );
};

export default Page;
