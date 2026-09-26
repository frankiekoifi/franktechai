import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "highlight.js/styles/github-dark.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FranktechAI — Your technical & digital assistant",
  description:
    "Ask FranktechAI anything about FrankTechSpace services, government procedures, troubleshooting, and our prices.",
  applicationName: "FranktechAI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FranktechAI",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* iOS-specific — Safari needs these outside the manifest */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="FranktechAI" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-ink-950 text-slate-200 antialiased">{children}</body>
    </html>
  );
}
