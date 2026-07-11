import { cn } from "@/shared/lib/cn";

import { NotePanelCacheProvider } from "./_components/note-panel-cache-provider";

export default function NoteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NotePanelCacheProvider>
      <main className={cn("flex-1 min-h-0 overflow-hidden bg-vague-bg")}>{children}</main>
    </NotePanelCacheProvider>
  );
}
