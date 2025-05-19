import { FirestoreDataConverter, Timestamp } from 'firebase/firestore';
import { useFirestoreDoc } from './useFirestoreDoc';
import { Event } from '@/types/event';

const eventConverter: FirestoreDataConverter<Event> = {
  toFirestore: (event: Event) => {
    return {
      projectId: event.projectId,
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      eventType: event.eventType,
      locationId: event.locationId,
      locationLabel: event.locationLabel,
      locationAddress: event.locationAddress,
      members: event.members,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
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
    } as Event;
  },
};

interface UseEventOptions {
  realtime?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

export function useEvent(eventId: string, options: UseEventOptions = {}) {
  return useFirestoreDoc<Event>('events', eventId, {
    ...options,
    converter: eventConverter,
  });
} 