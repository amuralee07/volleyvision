import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#050508",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "VolleyVision — AI Volleyball Coach",
  description:
    "Upload your volleyball footage and get AI-powered analysis, coaching tips, and highlight reels for scouting.",
  openGraph: {
    title: "VolleyVision — AI Volleyball Coach",
    description:
      "AI-powered volleyball film analysis, coaching insights, and auto-extracted highlight clips.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050508] text-white">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
