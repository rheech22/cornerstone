import { cn } from "../lib/cn";

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={cn("w-full")}>{children}</main>;
}
