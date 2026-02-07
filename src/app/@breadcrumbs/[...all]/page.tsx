import Link from "next/link";

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
    <header className={cn("flex justify-start p-6")}>
      <Link
        href="/"
        aria-label="Go home"
        title="Home"
        className={cn("inline-flex items-center justify-center rounded-md border border-[var(--foreground)] p-2 transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("h-5 w-5")}
          aria-hidden="true"
        >
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M10 21v-6h4v6" />
        </svg>
      </Link>
    </header>
  );
};

export default Page;
