import { Project } from "@/types/entities/Project";

export interface IProjectRepository {
  getAll(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  create(project: Project): Promise<void>;
  update(id: string, project: Partial<Project>): Promise<void>;
  delete(id: string): Promise<void>;
}
