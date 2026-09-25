import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "highlight.js/styles/github-dark.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FrankTechSpace AI — Your technical & digital assistant",
  description:
    "Ask FrankTechSpace anything about technology, digital services, troubleshooting and our procedures.",
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink-950 text-slate-200 antialiased">{children}</body>
    </html>
  );
}
