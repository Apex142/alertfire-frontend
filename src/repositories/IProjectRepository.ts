// src/repositories/IProjectRepository.ts
import { Project } from "@/types/entities/Project";

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  // findByField and findWhereIn are useful for more generic querying
  findByField(fieldName: keyof Project, value: any): Promise<Project[]>;
  findWhereIn(
    fieldName: keyof Project | "id",
    values: string[]
  ): Promise<Project[]>; // Allow querying by document ID in 'id' field
  getAll(): Promise<Project[]>; // Consider adding pagination/filters for real-world apps
  create(data: Omit<Project, "id">): Promise<Project>; // Service layer prepares all fields including timestamps
  update(
    id: string,
    data: Partial<Omit<Project, "id">>
  ): Promise<Project | null>; // Service layer prepares updatedAt
  delete(id: string): Promise<void>; // Hard delete, typically for admin use
}
