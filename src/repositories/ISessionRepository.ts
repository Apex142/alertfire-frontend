import { Session } from "@/types/entities/Session";
export interface ISessionRepository {
  create(
    sessionData: Omit<Session, "sessionId" | "createdAt" | "lastActiveAt">
  ): Promise<Session>;
  findById(sessionId: string): Promise<Session | null>;
  update(sessionId: string, data: Partial<Session>): Promise<Session | null>;
  delete(sessionId: string): Promise<void>;
  findByUid(uid: string): Promise<Session[]>; // Pour lister les sessions d'un utilisateur
}
