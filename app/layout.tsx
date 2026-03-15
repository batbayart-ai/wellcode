import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Wellcode Beauty",
    template: "%s | Wellcode Beauty",
  },
  description:
    "Premium beauty & skincare products — discover your glow with Wellcode Beauty.",
  keywords: ["beauty", "skincare", "cosmetics", "makeup", "wellness"],
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "Wellcode Beauty",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${inter.variable} ${playfair.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
