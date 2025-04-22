import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

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
      <body className={`${sans.className} antialiased flex flex-col h-screen`}>
        <div className="grow overflow-y-auto">
          {breadcrumbs}
          {children}
        </div>
        <footer className="w-full text-center underline underline-offset-4 font-semibold shrink-0">
          ©️ copyright 2025 by lch
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
