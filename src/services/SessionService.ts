// src/services/SessionService.ts
import { SessionRepository } from "@/repositories/SessionRepository";
import { Session } from "@/types/entities/Session";

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
    // 1. Révoque toutes les sessions existantes actives pour ce user AVANT de créer la nouvelle
    await this.repo.revokeAll(uid);

    const expiresAt = new Date(Date.now() + expiresInMs);
    const sessionData: any = {
      uid,
      device: device || "unknown_device",
      expiresAt,
      revoked: false,
    };
    if (ipAddress !== undefined) sessionData.ipAddress = ipAddress;
    if (userAgent !== undefined) sessionData.userAgent = userAgent;

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
