import { cn } from "../lib/cn";

export default function NoteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={cn("flex-1 px-2 pt-6 pb-8 noise-bg")}>{children}</main>;
}
