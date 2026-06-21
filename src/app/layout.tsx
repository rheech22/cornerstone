import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import { cn } from "@/shared/lib/cn";

import "./globals.css";
import "./_shared/styles/markdown-base.css";
import "./_shared/styles/markdown-code.css";
import "./_shared/styles/markdown-components.css";
import "./_shared/styles/markdown-layout.css";

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
        className={cn(sans.className, "antialiased relative flex flex-col text-base md:text-lg lg:text-xl min-h-dvh")}
      >
        {breadcrumbs}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
