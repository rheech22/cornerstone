import { cn } from "@/shared/lib/cn";

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={cn("reading w-full flex-1 flex flex-col")}>{children}</main>;
}
