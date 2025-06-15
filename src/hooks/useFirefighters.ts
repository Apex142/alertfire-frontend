import { firefighterService } from "@/services/FirefighterService";
import { User } from "@/types/entities/User";
import { useEffect, useState } from "react";

export function useFirefighters() {
  const [firefighters, setFirefighters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    firefighterService.getFirefighters().then((data) => {
      setFirefighters(data);
      setLoading(false);
    });
  }, []);

  return { firefighters, loading };
}
