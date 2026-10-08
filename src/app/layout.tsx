import type { Metadata } from "next";
// import fs from "fs";
// import path from "path";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MediaPreloader from "../components/MediaPreloader";
import DynamicFooter from "../components/DynamicFooter";
import SiteNavbar from "../components/SiteNavbar";
import LoadingScreen from "../components/LoadingScreen";
// import ChatBot from "../components/ChatBot";
// import ClickFireworks from "../components/ClickFireworks";
// import RightClickNotice from "../components/RightClickNotice";
import GreetingToast from "../components/GreetingToast";
// import RotatingBackground from "../components/RotatingBackground";
// import ParticlesBackground from "../components/ParticlesBackground";
// import BgGif from "../components/BgGif";
// import ParticlesBackground from "../components/ParticlesBackground";
 import Petfolio from "../components/Petfolio";
 // import SpiderWeb from "../components/SpiderWeb";
 
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
  description: "I love Rust",
};

// Read at build time so any image dropped into public/images/backgrounds
// is automatically in the rotation on the next build — no code change.
// const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// function getBackgroundImages(): string[] {
//   const dir = path.join(process.cwd(), "public", "images", "backgrounds");
//   return [];
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="[color-scheme:light_dark]" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint so there is no dark→light flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light')}catch(e){}`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingScreen />
        <MediaPreloader />
        {/* <ClickFireworks /> */}
        {/* <RightClickNotice /> */}
        <GreetingToast />
        {/* <Petfolio /> */}
        {/* <BgGif src="/bg_animaton/ani.gif" /> */}
        {/* <ParticlesBackground /> */}
        {/* <div className="fixed inset-0 z-0">
          <SpiderWeb opacity={30} thickness={15} />
        </div> */}
        <SiteNavbar />
        <div className="relative z-10 min-h-screen">
          <div className="theme-flip min-h-screen pt-0 pb-0 flex items-center justify-center">
            {children}
          </div>
          <DynamicFooter />
        </div>
        {/* <ChatBot /> */}
      </body>
    </html>
  );
}
