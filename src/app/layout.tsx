import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import "./globals.css";

export const metadata: Metadata = {
  title: "Cornerstone",
  description: "My public zt",
};

const sans = DM_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.className} antialiased`}>{children}</body>
    </html>
  );
}
