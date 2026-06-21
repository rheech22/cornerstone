import { cn } from "@/shared/lib/cn";

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={cn("w-full noise-bg")}>{children}</main>;
}
