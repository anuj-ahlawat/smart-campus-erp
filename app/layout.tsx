import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const interSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Smart Campus ERP",
  description: "Custom JWT auth + Mongo + Express campus ERP",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interSans.variable} ${mono.variable} min-h-screen bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
