import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FigureSwap — Troque Figurinhas da Copa",
    template: "%s | FigureSwap",
  },
  description:
    "O maior marketplace de figurinhas repetidas da Copa do Mundo. Encontre colecionadores, proponha trocas e complete seu álbum.",
  keywords: ["figurinhas", "copa do mundo", "troca", "álbum", "colecionador", "marketplace"],
  authors: [{ name: "FigureSwap" }],
  openGraph: {
    title: "FigureSwap — Troque Figurinhas da Copa",
    description: "Encontre colecionadores e troque figurinhas repetidas facilmente.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5fa" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
