// src/repositories/TechnicianRepository.ts
import { db } from "@/lib/firebase/client";
import { User } from "@/types/entities/User";
import { TECH_OR_ADMIN } from "@/types/enums/GlobalRole";
import {
  collection,
  DocumentData,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { ITechnicianRepository } from "./ITechnicianRepository";

export class TechnicianRepository implements ITechnicianRepository {
  async getAll(): Promise<User[]> {
    const q = query(
      collection(db, "users"),
      where("globalRole", "array-contains-any", TECH_OR_ADMIN)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DocumentData as User);
  }
}
