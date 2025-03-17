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
    <div className="flex justify-center text-black font-bold pt-6">
      {breadcrumbs.map((crumb, index) => (
        <div
          key={index}
          className="[&:not(:last-child)]:after:content-['/'] after:mx-2"
        >
          <Link href={{ pathname: crumb.href }}>
            {crumb.text.toUpperCase()}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Page;
