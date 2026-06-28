import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// === INI ADALAH JANTUNG SEO WEB KAMU ===
export const metadata: Metadata = {
  title: "Kompresor Gambar & Video Online Gratis | Tanpa Pecah",
  description: "Kecilkan ukuran file foto (JPG, PNG) dan video (MP4) hingga 80% secara gratis tanpa menurunkan kualitas. Proses aman langsung di browser, tanpa iklan.",
  keywords: ["kompres gambar", "kompres video", "kecilkan ukuran foto", "video compressor", "image optimizer", "kompres foto tanpa pecah", "alat kompres online"],
  authors: [{ name: "Faishal Nizaar Rizq" }],
  creator: "Faishal Nizaar Rizq",
  openGraph: {
    title: "Kompresor Gambar & Video Canggih",
    description: "Kecilkan ukuran file media kamu secara gratis dan aman. Proses kompresi video berjalan langsung di perangkatmu!",
    url: "https://nama-domain-kamu.com",
    siteName: "Media Optimizer",
    images: [
      {
        url: "https://nama-domain-kamu.com/banner-seo.png", // Buat gambar banner untuk sosial media
        width: 1200,
        height: 630,
        alt: "Banner Kompresor Media",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kompresor Gambar & Video Online Gratis",
    description: "Kecilkan ukuran file tanpa membuat buram. Coba sekarang secara gratis!",
    images: ["https://nama-domain-kamu.com/banner-seo.png"],
  },
  robots: {
    index: true, // Menyuruh bot Google untuk mengindeks web ini
    follow: true, // Menyuruh bot Google untuk mengikuti link di web ini
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}