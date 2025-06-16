// NE PAS mettre "use client" ici !
import Navbar from "@/components/layout/Navbar";
import type { Metadata } from "next";
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { ThemeProvider } from "next-themes";
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
import { ThemeProvider } from "next-themes";
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
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
<<<<<<< HEAD
  title: "alertfire",
  description: "Votre plateforme de gestion d'événements",
=======
  title: "AlertFire",
  description: "Votre plateforme de gestion de feux et d'incendies",
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
  title: "AlertFire",
  description: "Votre plateforme de gestion de feux et d'incendies",
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Toaster position="top-right" richColors />
        <Providers>
          <Navbar />
          {children}
        </Providers>
=======
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
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
<<<<<<< HEAD
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
      </body>
    </html>
  );
}
