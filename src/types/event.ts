import { Timestamp } from 'firebase/firestore';

export interface Event {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  locationId: string;
  locationLabel: string;
  locationAddress?: string;
  members: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreEvent {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  locationId: string;
  locationLabel: string;
  locationAddress?: string;
  members: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const convertFirestoreEvent = (doc: { id: string; data: () => any }): Event => {
  const data = doc.data();
  return {
    id: doc.id,
    projectId: data.projectId,
    title: data.title,
    description: data.description,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    eventType: data.eventType,
    locationId: data.locationId,
    locationLabel: data.locationLabel,
    locationAddress: data.locationAddress,
    members: data.members || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}; 