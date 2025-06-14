// src/repositories/IProjectRepository.ts
import { Project, ProjectDayPlanning } from "@/types/entities/Project";

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByField(fieldName: keyof Project, value: any): Promise<Project[]>;
  findWhereIn(
    fieldName: keyof Project | "id",
    values: string[]
  ): Promise<Project[]>;
  getAll(): Promise<Project[]>;
  create(data: Omit<Project, "id">): Promise<Project>;
  update(
    id: string,
    data: Partial<Omit<Project, "id" | "createdAt" | "createdBy">>
  ): Promise<Project | null>;
  upsertDayPlanning(
    projectId: string,
    dayPlanning: ProjectDayPlanning
  ): Promise<Project | null>;
  delete(id: string): Promise<void>;
}
