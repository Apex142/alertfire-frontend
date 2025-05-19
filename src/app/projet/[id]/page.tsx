import { Metadata } from 'next';
import { Suspense } from 'react';
import ProjectDashboardWrapper from './ProjectDashboardWrapper';

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Projet ${params.id} | Showmate`,
    description: 'Détails du projet',
  };
}

export default function ProjectPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ProjectDashboardWrapper projectId={params.id} />
    </Suspense>
  );
} 