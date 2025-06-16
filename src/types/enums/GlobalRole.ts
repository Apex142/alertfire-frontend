<<<<<<< HEAD
<<<<<<< HEAD
export enum GlobalRole {
  ADMIN = "admin",
  USER = "user",
}
=======
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
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
<<<<<<< HEAD
>>>>>>> 5162f99 (Refactor code structure and remove redundant changes)
=======
>>>>>>> 5162f9988e78ee543b5f4b76cc6f52b0608733b4
