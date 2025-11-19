"use client";

import { useAuth } from "@/contexts/AuthContext";
import { GlobalRole } from "@/types/enums/GlobalRole";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { BrandLoader } from "@/components/ui/BrandLoader";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { User as AppUser } from "@/types/entities/User";

/* ---------- Lazy-load client-only views --------------------------------- */
const SensorsAdminView = dynamic(() => import("./AdminView"), { ssr: false });
const SensorsTechnicianView = dynamic(() => import("./TechnicianView"), {
  ssr: false,
});
const SensorsFirefighterView = dynamic(() => import("./FirefighterView"), {
  ssr: false,
});

export default function SensorsPage() {
  const { isAuthenticated, loading } = useRequireAuth();
  const { appUser } = useAuth();

  if (loading || !isAuthenticated || !appUser) {
    return <BrandLoader message="Préparation de vos capteurs connectés" />;
  }

  return <SensorsContent appUser={appUser} />;
}

function SensorsContent({ appUser }: { appUser: AppUser }) {
  const roles = appUser.globalRole;

  if (!roles) {
    return <BrandLoader message="Initialisation des autorisations" />;
  }

  if (roles.includes(GlobalRole.ADMIN)) {
    return <SensorsAdminView />;
  }
  if (roles.includes(GlobalRole.TECHNICIAN)) {
    return <SensorsTechnicianView />;
  }
  if (roles.includes(GlobalRole.FIREFIGHTER)) {
    return <SensorsFirefighterView />;
  }

  return notFound(); // utilisateur non autorisé
}
