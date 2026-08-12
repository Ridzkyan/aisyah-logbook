import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LogBook Untuk Aisyah dari Ridho 💙",
  description: "Buat Logbook KKN/PLP/AM dalam Hitungan Menit - Made with love by Ridho",
  keywords: ["logbook", "KKN", "PLP", "AM", "mahasiswa", "asistensi mengajar"],
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
