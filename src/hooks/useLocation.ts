import { FirestoreDataConverter, Timestamp } from 'firebase/firestore';
import { useFirestoreDoc } from './useFirestoreDoc';
import { Location } from '@/types/location';

const locationConverter: FirestoreDataConverter<Location> = {
  toFirestore: (location: Location) => {
    return {
      label: location.label,
      address: location.address,
      notes: location.notes,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
      projectId: location.projectId,
      companyId: location.companyId,
      coordinates: location.coordinates,
      type: location.type,
      capacity: location.capacity,
      amenities: location.amenities,
      contacts: location.contacts,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      label: data.label,
      address: data.address,
      notes: data.notes,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      projectId: data.projectId,
      companyId: data.companyId,
      coordinates: data.coordinates || null,
      type: data.type || 'other',
      capacity: data.capacity || null,
      amenities: data.amenities || [],
      contacts: data.contacts || [],
    } as Location;
  },
};

interface UseLocationOptions {
  realtime?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

export function useLocation(locationId: string, options: UseLocationOptions = {}) {
  return useFirestoreDoc<Location>('locations', locationId, {
    ...options,
    converter: locationConverter,
  });
} 