// src/hooks/useTechnicians.ts
"use client";

import { technicianService } from "@/services/TechnicianService";
import { User } from "@/types/entities/User";
import { useEffect, useState } from "react";

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    technicianService
      .getTechnicians()
      .then((list) => mounted && setTechnicians(list))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { technicians, loading };
}
