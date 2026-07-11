import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_SC, Noto_Serif_SC, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "沐伊蛋糕新加坡 | MuYi Cakes SG",
  description: "新加坡手作蛋糕 WhatsApp 预订。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${notoSerifSC.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FFF7EC] text-[#2B1E1A]">{children}</body>
    </html>
  );
}
