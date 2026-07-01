import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MediaPreloader from "../components/MediaPreloader";
import DynamicFooter from "../components/DynamicFooter";
import LoadingScreen from "../components/LoadingScreen";
import ChatBot from "../components/ChatBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mohabbat",
  description: "Focusing on AI/ML",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="[color-scheme:light_dark]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingScreen />
        <MediaPreloader />
        <div className="min-h-screen">
          <div className="min-h-screen pb-16 flex items-center justify-center">
            {children}
          </div>
          <DynamicFooter />
        </div>
        <ChatBot />
      </body>
    </html>
  );
}
