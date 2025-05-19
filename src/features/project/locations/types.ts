import { Location } from '@/types/location';

export type LocationType = 'saved' | 'public' | 'new';
export type SearchType = 'business' | 'venue' | 'address';
export type Step = 'type' | 'details' | 'policy';

export interface LocationFormState {
  locationType: LocationType | null;
  selectedSavedLocation: string;
  selectedPublicLocation: string;
  name: string;
  address: string;
  notes: string;
  editPolicy: 'creativecommon' | 'company' | 'private';
}

export interface StepProps {
  state: LocationFormState;
  onChange: (updates: Partial<LocationFormState>) => void;
  companyLocations: Location[];
  publicLocations: Location[];
} 