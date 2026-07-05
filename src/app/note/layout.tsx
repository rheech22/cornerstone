import { cn } from "@/shared/lib/cn";

export default function NoteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={cn("flex-1 min-h-0 overflow-hidden bg-vague-bg")}>{children}</main>;
}
