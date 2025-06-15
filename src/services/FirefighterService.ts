import { FirefighterRepository } from "@/repositories/FirefighterRepository";
import { IFirefighterRepository } from "@/repositories/IFirefighterRepository";

export class FirefighterService {
  constructor(
    private repo: IFirefighterRepository = new FirefighterRepository()
  ) {}

  /** Abstraction métier : simple passthrough */
  getFirefighters() {
    return this.repo.getAll();
  }
}

export const firefighterService = new FirefighterService();
