import { FirestoreDataConverter, Timestamp } from 'firebase/firestore';
import { useFirestoreDoc } from './useFirestoreDoc';
import { Company } from '@/types/company';

const companyConverter: FirestoreDataConverter<Company> = {
  toFirestore: (company: Company) => {
    return {
      name: company.name,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      createdBy: company.createdBy,
      members: company.members,
      settings: company.settings,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
      members: data.members || [],
      settings: data.settings || {
        defaultCurrency: 'EUR',
        language: 'fr',
      },
    } as Company;
  },
};

interface UseCompanyOptions {
  realtime?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

export function useCompany(companyId: string, options: UseCompanyOptions = {}) {
  return useFirestoreDoc<Company>('companies', companyId, {
    ...options,
    converter: companyConverter,
  });
} 