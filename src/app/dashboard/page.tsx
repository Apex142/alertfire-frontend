"use client";

import MapView from "@/components/MapView";

export default function DashboardPage() {
  return (
    /* prend tout l’écran, la carte remplit l’espace restant */
    <main className="flex flex-col h-screen w-screen">
      {/* Carte plein écran */}
      <div className="flex-1">
        <MapView />
      </div>
    </main>
  );
}
