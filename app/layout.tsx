import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Genie – AI Voice Tutor",
  description: "Real-time English speaking practice for kids.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
