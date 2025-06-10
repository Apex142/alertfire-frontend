import { Location } from "@/types/entities/Location";

export interface ILocationRepository {
  create(
    locationData: Omit<Location, "id" | "createdAt" | "updatedAt">
  ): Promise<Location>;
  findById(id: string): Promise<Location | null>;
  update(id: string, data: Partial<Location>): Promise<Location | null>;
  delete(id: string): Promise<void>;
  findByCreator(userId: string): Promise<Location[]>;
  findByCompany(companyId: string): Promise<Location[]>;
  findPublic(): Promise<Location[]>;
}
