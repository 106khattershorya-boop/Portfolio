import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-technical",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shorya Khatter — Full-Stack Developer × Generative AI",
  description:
    "Portfolio of Shorya Khatter — B.Tech CSE student at MAIT building modern web applications and exploring Generative AI, applied ML and RAG. NEON NOIR: a cinematic city built around a developer's identity.",
  keywords: [
    "Shorya Khatter",
    "Full-Stack Developer",
    "Generative AI",
    "RAG",
    "React",
    "Python",
    "FastAPI",
    "Portfolio",
  ],
  authors: [{ name: "Shorya Khatter" }],
  openGraph: {
    title: "Shorya Khatter — Full-Stack Developer × Generative AI",
    description:
      "Building digital products. Exploring intelligence. A cinematic NEON NOIR portfolio — Paris × NYC cyberpunk, built in WebGL.",
    siteName: "Shorya Khatter // Portfolio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Shorya Khatter — Full-Stack Developer × Generative AI",
    description:
      "Building digital products. Exploring intelligence. A cinematic NEON NOIR portfolio.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07090D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-body antialiased bg-obsidian text-bone`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
