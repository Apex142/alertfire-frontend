// src/enums/GlobalRole.ts
export enum GlobalRole {
  USER = "user",
  FIREFIGHTER = "firefighter",
  TECHNICIAN = "technician",
  ADMIN = "admin",
}

// utils
export const TECH_OR_ADMIN = [GlobalRole.TECHNICIAN, GlobalRole.ADMIN];
export const FIRE_OR_ADMIN = [GlobalRole.FIREFIGHTER, GlobalRole.ADMIN];
