"use client";

import { useAuth } from "@/contexts/AuthContext";
import { GlobalRole } from "@/types/enums/GlobalRole";
import { notFound } from "next/navigation";
import SensorsAdminView from "./AdminView";
import SensorsFirefighterView from "./FirefighterView";
import SensorsTechnicianView from "./TechnicianView";

export default function SensorsPage() {
  const { appUser } = useAuth();

  if (!appUser) return <p>Chargement...</p>;

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

  return notFound(); // Pour les "user" non autorisés
}
