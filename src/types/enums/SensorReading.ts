import { Timestamp } from "firebase/firestore";

export interface SensorReading {
  temperature: number; // °C
  smoke: number; // ppm
  flame: boolean; // true = flamme détectée
  battery: number; // % batterie
  createdAt: Timestamp;
}
