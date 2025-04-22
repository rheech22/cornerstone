export default function NoteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="pt-6 px-2 pb-8">{children}</main>;
}
