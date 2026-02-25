import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Noto_Sans_TC } from "next/font/google";
import { SmoothScrollProvider } from "@/components/ultra/smooth-scroll-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const siteUrlCandidate =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  process.env.APP_URL ??
  process.env.ZEABUR_URL ??
  process.env.ZEABUR_PUBLIC_URL ??
  process.env.ZEABUR_PUBLIC_DOMAIN ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL ??
  "http://localhost:3000";

const siteUrl = siteUrlCandidate.startsWith("http://") || siteUrlCandidate.startsWith("https://")
  ? siteUrlCandidate
  : `https://${siteUrlCandidate}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Studio Pro | 專業攝影工作室",
    template: "%s | Studio Pro",
  },
  description: "高端攝影工作室，提供從企劃到交付的禮賓級預約流程。",
  openGraph: {
    type: "website",
    siteName: "Studio Pro",
    title: "Studio Pro | 專業攝影工作室",
    description: "高端攝影工作室，提供從企劃到交付的禮賓級預約流程。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Studio Pro" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Pro | 專業攝影工作室",
    description: "高端攝影工作室，提供從企劃到交付的禮賓級預約流程。",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${inter.variable} ${jakarta.variable} ${notoSansTC.variable}`}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
