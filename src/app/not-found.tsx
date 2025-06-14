"use client";

import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* même padding que dans ton Layout pour laisser la place au Navbar */}
      <div className="h-full md:pb-14 pb-32 overflow-y-auto pt-[65px]">
        <main className="h-full flex flex-col items-center justify-center gap-6 text-center p-6">
          <h1 className="text-3xl font-bold">404 – Page introuvable</h1>
          <p className="text-muted-foreground max-w-md">
            Oups ! Cette page n’existe pas ou n’est plus disponible.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button asChild>
              <a href="/">Accueil</a>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
