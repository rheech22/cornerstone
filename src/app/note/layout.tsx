export default function NoteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="pt-10 px-6 pb-8">{children}</main>;
}
