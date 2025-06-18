"use client";

import { useAuth } from "@/contexts/AuthContext";
import { GlobalRole } from "@/types/enums/GlobalRole";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

/* ---------- Lazy-load client-only views --------------------------------- */
const SensorsAdminView = dynamic(() => import("./AdminView"), { ssr: false });
const SensorsTechnicianView = dynamic(() => import("./TechnicianView"), {
  ssr: false,
});
const SensorsFirefighterView = dynamic(() => import("./FirefighterView"), {
  ssr: false,
});

export default function SensorsPage() {
  const { appUser } = useAuth();

  if (!appUser) return <p>Chargement…</p>;

  const roles = appUser.globalRole;

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
