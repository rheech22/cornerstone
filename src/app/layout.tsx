import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import "./globals.css";

export const metadata: Metadata = {
  title: "cornerstone",
  description: "my public notes",
  icons: "/favicon.png",
};

const sans = DM_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
  breadcrumbs,
}: Readonly<{
  children: React.ReactNode;
  breadcrumbs: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.className} antialiased`}>
        {breadcrumbs}
        {children}
        <footer className="w-full h-9  text-center underline underline-offset-4 font-semibold">
          ©️ copyright 2025 by lch
        </footer>
      </body>
    </html>
  );
}
