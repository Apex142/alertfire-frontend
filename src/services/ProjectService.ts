import { ProjectRepository } from "@/repositories/ProjectRepository";
import { Project } from "@/types/entities/Project";

const repo = new ProjectRepository();

export const ProjectService = {
  /* CRUD */
  getAll: (): Promise<Project[]> => repo.getAll(),
  getById: (id: string): Promise<Project | null> => repo.getById(id),
  create: (p: Project): Promise<void> => repo.create(p),
  update: (id: string, u: Partial<Project>): Promise<void> =>
    repo.update(id, u),
  delete: (id: string): Promise<void> => repo.delete(id),

  /* TEMPS RÉEL */
  subscribe: (
    cb: (projects: Project[]) => void,
    err?: (e: Error) => void
  ): (() => void) => repo.onSnapshot(cb, err),
};
