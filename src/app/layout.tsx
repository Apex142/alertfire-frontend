// NE PAS mettre "use client" ici !
import Navbar from "@/components/layout/Navbar";
import type { Metadata } from "next";
<<<<<<< HEAD
=======
import { ThemeProvider } from "next-themes";
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "alertfire",
  description: "Votre plateforme de gestion d'événements",
=======
  title: "AlertFire",
  description: "Votre plateforme de gestion de feux et d'incendies",
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Toaster position="top-right" richColors />
        <Providers>
          <Navbar />
          {children}
        </Providers>
=======
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-text w-full max-w-full`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <Toaster position="top-right" richColors />
            <Navbar />
            {children}
          </Providers>
        </ThemeProvider>
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
      </body>
    </html>
  );
}
