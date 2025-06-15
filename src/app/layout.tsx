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
      <body
        className={`${sans.className} antialiased relative flex flex-col text-base md:text-lg lg:text-xl`}
      >
        {breadcrumbs}
        {children}
        {/*
        <footer className="absolute bottom-0 w-full flex justify-center py-4">
          <span className="text-center underline underline-offset-4 font-semibold shrink-0">
            ©️ copyright 2025 by lch
          </span>
        </footer>
	*/}
        <Analytics />
      </body>
    </html>
  );
}
