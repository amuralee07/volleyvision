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
  title: "VolleyVision — Volleyball Film Analysis",
  description:
    "Upload practice or match film. Get technique notes, tagged plays, and scout-ready highlight clips.",
  openGraph: {
    title: "VolleyVision — Volleyball Film Analysis",
    description:
      "Drop in volleyball film. Get coaching notes, tagged plays, and clips ready for coaches and scouts.",
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
