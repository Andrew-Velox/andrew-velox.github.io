import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Press_Start_2P,
  Audiowide,
  Major_Mono_Display,
  Dancing_Script,
  Permanent_Marker,
  Rubik_Spray_Paint,
  Caveat_Brush,
  Bungee_Inline,
  Kalam,
} from "next/font/google";
import "./globals.css";
import MediaPreloader from "../components/MediaPreloader";
import DynamicFooter from "../components/DynamicFooter";
import LoadingScreen from "../components/LoadingScreen";
import ChatBot from "../components/ChatBot";
import ClickFireworks from "../components/ClickFireworks";
// import ParticlesBackground from "../components/ParticlesBackground";
// import BgGif from "../components/BgGif";
import ParticlesBackground from "../components/ParticlesBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["monospace", "Courier New"],
  adjustFontFallback: true,
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["fantasy", "sans-serif"],
  adjustFontFallback: true,
});

const majorMono = Major_Mono_Display({
  variable: "--font-major-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["monospace", "Courier New"],
  adjustFontFallback: true,
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["cursive", "sans-serif"],
  adjustFontFallback: true,
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["cursive", "Impact", "sans-serif"],
  adjustFontFallback: true,
});

const rubikSpray = Rubik_Spray_Paint({
  variable: "--font-rubik-spray",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["fantasy", "Impact", "sans-serif"],
  adjustFontFallback: true,
});

const caveatBrush = Caveat_Brush({
  variable: "--font-caveat-brush",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["cursive", "sans-serif"],
  adjustFontFallback: true,
});

const bungeeInline = Bungee_Inline({
  variable: "--font-bungee-inline",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["Impact", "sans-serif"],
  adjustFontFallback: true,
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
  fallback: ["cursive", "sans-serif"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Mohabbat",
  description: "I love Rust",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="[color-scheme:light_dark]">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} ${audiowide.variable} ${majorMono.variable} ${dancing.variable} ${permanentMarker.variable} ${rubikSpray.variable} ${caveatBrush.variable} ${bungeeInline.variable} ${kalam.variable} antialiased`}
      >
        <LoadingScreen />
        <MediaPreloader />
        <ClickFireworks />
        {/* <BgGif src="/bg_animaton/ani.gif" /> */}
        <ParticlesBackground />
        <div className="relative z-10 min-h-screen">
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
