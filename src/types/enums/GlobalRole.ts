<<<<<<< HEAD
export enum GlobalRole {
  ADMIN = "admin",
  USER = "user",
}
=======
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
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
