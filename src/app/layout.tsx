import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "ALIF — Your personal settling journey",
  description: "From planning the move to feeling at home.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
    <ClerkProvider>{children}</ClerkProvider>
  ) : (
    children
  );

  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>{content}</body>
    </html>
  );
}
