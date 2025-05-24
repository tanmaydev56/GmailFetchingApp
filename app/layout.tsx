import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google"; // Using standard Google Fonts
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

// Option 1: Using standard Google Fonts (recommended)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

// Option 2: If you specifically want Geist (not a Google Font)
// Note: Geist is a custom font by Vercel, not available via Google Fonts
// You would need to use local font files or @font-face

export const metadata: Metadata = {
  title: "Email Manager",
  description: "Your email management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans bg-gray-50">
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}