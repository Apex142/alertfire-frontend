import { FirestoreDataConverter } from 'firebase/firestore';
import { useFirestoreDoc } from './useFirestoreDoc';
import { Project } from '@/types/project';

// Converter pour Project
const projectConverter: FirestoreDataConverter<Project> = {
  toFirestore: (project: Project) => {
    return {
      projectName: project.projectName,
      acronym: project.acronym,
      color: project.color,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      companyId: project.companyId,
      createdBy: project.createdBy,
      privacy: project.privacy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      projectName: data.projectName,
      acronym: data.acronym,
      color: data.color,
      description: data.description,
      status: data.status || 'À confirmer',
      startDate: data.startDate,
      endDate: data.endDate,
      companyId: data.companyId,
      createdBy: data.createdBy,
      privacy: data.privacy || 'privé',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Project;
  },
};

interface UseProjectOptions {
  realtime?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

export function useProject(projectId: string, options: UseProjectOptions = {}) {
  return useFirestoreDoc<Project>('projects', projectId, {
    ...options,
    converter: projectConverter,
  });
} 