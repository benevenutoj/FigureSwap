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
  metadataBase: new URL('https://figureswap.com'),
  title: {
    default: "FigureSwap — Match Perfeito de Figurinhas",
    template: "%s | FigureSwap",
  },
  description:
    "O algoritmo inteligente que encontra quem tem a figurinha que você precisa e quer a figurinha que você tem. Troque figurinhas da Copa com facilidade e segurança.",
  keywords: ["figurinhas", "copa do mundo", "troca", "álbum", "colecionador", "marketplace", "match"],
  authors: [{ name: "FigureSwap" }],
  openGraph: {
    title: "FigureSwap — Match Perfeito de Figurinhas",
    description: "O algoritmo inteligente que encontra quem tem a figurinha que você precisa e quer a figurinha que você tem.",
    url: "https://figureswap.com",
    siteName: "FigureSwap",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FigureSwap",
      },
    ],
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "FigureSwap — Match Perfeito de Figurinhas",
    description: "Pare de perder tempo em listas confusas. Nosso algoritmo encontra a troca perfeita na sua cidade.",
  }
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
