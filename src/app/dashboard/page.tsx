"use client";

<<<<<<< HEAD
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
=======
import {
  Activity,
  BarChart2,
  CircuitBoard,
  FileText,
  Flame,
  LogOut,
  Map,
  Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import Banner from "@/components/ui/modal/Banner";
import Dashboard from "./Dashboard";

import Button from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { appUser, currentSessionId, logout } = useAuth();

  const isProfileIncomplete =
    !appUser?.firstName || !appUser?.lastName || !appUser?.email;
  const isRegistered = true;

  const handleLogout = async () => {
    await logout("Manual logout", currentSessionId);
    router.push("/");
  };

  return (
    <Dashboard>
      {/* ----------- BANNIÈRES D’INFORMATION ----------- */}
      {!isRegistered && (
        <Banner type="warning">
          <span className="font-semibold">
            Votre compte n’est pas encore validé. Complétez les infos requises.
          </span>
        </Banner>
      )}
      {isProfileIncomplete && (
        <Banner type="error" link="/settings/personal-info">
          <span className="font-semibold">
            Profil incomplet : complétez vos informations personnelles.
          </span>
        </Banner>
      )}

      {/* ----------- CARTES PRINCIPALES ----------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card onClick={() => router.push("/sensors")}>
          <div className="flex items-center">
            <CircuitBoard className="mr-4" />
            <h2 className="text-lg font-semibold">Capteurs</h2>
          </div>
        </Card>

        <Card onClick={() => router.push("/alerts")}>
          <div className="flex items-center">
            <Flame className="mr-4" />
            <h2 className="text-lg font-semibold">Alertes Feu</h2>
          </div>
        </Card>

        <Card onClick={() => router.push("/analytics")}>
          <div className="flex items-center">
            <BarChart2 className="mr-4" />
            <h2 className="text-lg font-semibold">Analytics</h2>
          </div>
        </Card>

        <Card onClick={() => router.push("/reports")}>
          <div className="flex items-center">
            <FileText className="mr-4" />
            <h2 className="text-lg font-semibold">Rapports</h2>
          </div>
        </Card>

        <Card onClick={() => router.push("/")}>
          <div className="flex items-center">
            <Map className="mr-4" />
            <h2 className="text-lg font-semibold">Carte Live</h2>
          </div>
        </Card>

        <Card onClick={() => router.push("/settings")}>
          <div className="flex items-center">
            <Settings2 className="mr-4" />
            <h2 className="text-lg font-semibold">Paramètres</h2>
          </div>
        </Card>

        <Card onClick={() => router.push("/system-status")}>
          <div className="flex items-center">
            <Activity className="mr-4" />
            <h2 className="text-lg font-semibold">État Système</h2>
          </div>
        </Card>
      </div>

      {/* Logout Button */}
      <div className="mt-6">
        <Button
          variant="outlineRed"
          size="lg"
          isFullWidth
          endIcon={<LogOut className="w-5 h-5" />}
          onClick={logout}
        >
          Se déconnecter
        </Button>
      </div>
    </Dashboard>
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
  );
}
