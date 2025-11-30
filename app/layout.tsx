import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EverGo - The Global Network for Sports",
  description: "Social network for athletes and active people with real-time rankings.",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#0078D4",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EverGo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <MobileNav />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
