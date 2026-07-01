import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoShortlist — Find Your Perfect Car",
  description: "Go from confused to confident. A guided car finder that matches you with the right cars in 2 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
