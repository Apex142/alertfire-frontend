'use client';

import { useState } from 'react';
import Step1InformationsGenerales from './Step1InformationsGenerales';
import Step2CompanyAndPrivacy from './Step2CompanyAndPrivacy';
import { createPost, createMembership } from '@/features/project/roles/add/roleService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUserData } from '@/hooks/useUserData';
import { notify } from '@/lib/notify';
import { useRouter } from 'next/navigation';

export default function CreateProjectFlow({ initialDate }: { initialDate?: Date }) {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<any>(null);
  const { user } = useUserData();
  const router = useRouter();

  const handleCreateProject = async (projectData: any) => {
    if (!user) return;

    try {
      // 1. Création du projet
      const projectRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
      });
      const projectId = projectRef.id;

      // 2. Création du post admin
      await createPost({
        projectId,
        postData: {
          isGlobal: true,
          eventId: '',
          createdBy: user.uid,
          title: 'Administrateur',
          icon: 'admin-icon', // ou une icône par défaut
          priority: 0,
          category: 'admin',
          memberIds: [user.uid],
          role_template_id: 'admin',
        }
      });

      // 3. Création du membership admin
      await createMembership({
        userId: user.uid,
        projectId,
        role: 'admin',
        status: 'approved',
        linkType: 'project',
        selectedEvents: []
      });

      notify.success('Projet créé avec succès !');
      router.push(`/projet/${projectId}/`);
    } catch (e) {
      notify.error('Erreur lors de la création du projet : ' + (e instanceof Error ? e.message : ''));
    }
  };

  return (
    <>
      {step === 1 && (
        <Step1InformationsGenerales
          onNext={(data: any) => {
            setStep1Data(data);
            setStep(2);
          }}
          initialDate={initialDate}
        />
      )}
      {step === 2 && (
        <Step2CompanyAndPrivacy
          onNext={async (data) => {
            const mergedData = { ...step1Data, ...data };
            await handleCreateProject(mergedData);
          }}
          onBack={() => setStep(1)}
        />
      )}
    </>
  );
} 