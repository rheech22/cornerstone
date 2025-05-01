export default function NoteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="w-full h-full flex">{children}</main>;
}
