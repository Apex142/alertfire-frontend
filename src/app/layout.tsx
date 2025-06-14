// NE PAS mettre "use client" ici !
import Navbar from "@/components/layout/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "alertfire",
  description: "Votre plateforme de gestion d'événements",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Toaster position="top-right" richColors />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
