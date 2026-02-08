import Link from "next/link";

import { ArrowLeftIcon } from "@/app/components/arrow-left";
import { cn } from "@/app/lib/cn";

type Props = {
  params: Promise<{
    all: string[];
  }>;
};

const Page = async ({ params }: Props) => {
  const segments = (await params).all;
  const section = segments[0];

  if (section !== "blog" && section !== "note") {
    return null;
  }

  return (
    <header className={cn("flex justify-start p-6 noise-bg")}>
      <Link
        href="/"
        aria-label="Go home"
        title="Home"
        className={cn("inline-flex items-center justify-center")}
      >
        <ArrowLeftIcon/>
      </Link>
    </header>
  );
};

export default Page;

