import { cn } from "@/shared/lib/cn";

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={cn("reading flex min-h-0 w-full flex-1 flex-col overflow-y-auto")}>{children}</main>;
}
