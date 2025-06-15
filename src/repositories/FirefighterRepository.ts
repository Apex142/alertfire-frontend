import { db } from "@/lib/firebase/client";
import { User } from "@/types/entities/User";

import {
  collection,
  DocumentData,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { IFirefighterRepository } from "./IFirefighterRepository";
import { FIRE_OR_ADMIN } from "@/types/enums/GlobalRole";

export class FirefighterRepository implements IFirefighterRepository {
  async getAll(): Promise<User[]> {
    const q = query(
      collection(db, "users"),
      where("globalRole", "array-contains-any", FIRE_OR_ADMIN)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DocumentData as User);
  }
}
