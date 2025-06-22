// src/services/SessionService.ts
import { SessionRepository } from "@/repositories/SessionRepository";
import { Session } from "@/types/entities/Session";
import { Timestamp } from "firebase/firestore";

export class SessionService {
  private repo: SessionRepository;

  constructor(repo?: SessionRepository) {
    this.repo = repo || new SessionRepository();
  }

  /**
   * Crée une nouvelle session après avoir révoqué toutes les sessions actives de l'utilisateur.
   */
  async createSession({
    uid,
    device,
    ipAddress,
    userAgent,
    expiresInMs = 7 * 24 * 60 * 60 * 1000,
  }: {
    uid: string;
    device: string;
    ipAddress?: string;
    userAgent?: string;
    expiresInMs?: number;
  }): Promise<Session> {
    // Import Timestamp from Firestore
    // import { Timestamp } from "firebase/firestore"; // Uncomment if not already imported
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + expiresInMs));

    const sessionData: Omit<
      Session,
      "sessionId" | "createdAt" | "lastActiveAt"
    > = {
      uid,
      device: device || "unknown_device",
      ipAddress: ipAddress || "",
      userAgent: userAgent || "",
      expiresAt,
      revoked: false,
    };

    return this.repo.create(sessionData);
  }

  async updateActivity(sessionId: string) {
    return this.repo.update(sessionId, {});
  }

  async revokeSession(sessionId: string) {
    return this.repo.revoke(sessionId);
  }

  async revokeAllSessions(uid: string) {
    return this.repo.revokeAll(uid);
  }

  async getUserSessions(uid: string) {
    return this.repo.findByUid(uid);
  }
}

export const sessionService = new SessionService();
