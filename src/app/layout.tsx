import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CommandPalette } from "@/components/command-palette/command-palette";

const fontArabic = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alhana Logistique",
  description: "Alhana Logistique — نظام لوجستيك وCRM لمجموعة الهناء التجارية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${fontArabic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        <Providers>
          {children}
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
