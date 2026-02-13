import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SmoothScrollProvider } from "@/components/ultra/smooth-scroll-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Studio Pro | 暗黑奢華攝影",
    template: "%s | Studio Pro",
  },
  description: "以暗黑奢華美學打造的高端攝影，提供禮賓級預約流程。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
