import { Location as FirestoreLocation } from '@/types/location';

export interface DisplayLocation {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
  createdBy?: string;
  companyId?: string | null;
  isPublic?: boolean;
}

export const adaptLocationToDisplay = (location: FirestoreLocation): DisplayLocation => {
  return {
    id: location.id,
    name: location.label,
    address: location.address,
    type: location.isLegit ? 'Vérifié' : 'Non vérifié',
    status: getLocationStatus(location.editPolicy),
    createdBy: location.createdBy,
    companyId: location.companyId,
    isPublic: location.isPublic
  };
};

const getLocationStatus = (editPolicy: string): string => {
  switch (editPolicy) {
    case 'private':
      return 'privé';
    case 'company':
      return 'entreprise';
    case 'creativecommon':
      return 'collaboratif';
    default:
      return 'inconnu';
  }
}; 