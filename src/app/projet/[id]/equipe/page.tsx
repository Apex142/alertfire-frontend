"use client";

import { useActiveProject } from '@/stores/useActiveProjectStore';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AddRoleFlow from '@/features/project/roles/add/AddRoleFlow';
import { Card } from '@/components/ui/Card';
import { Post, ProjectMember } from '@/stores/useProjectData';

interface PageProps {
  params: { id: string };
}

// Fonction utilitaire pour grouper les membres par post
function groupMembersByPost(posts: Post[], members: ProjectMember[]) {
  return posts.map(post => ({
    ...post,
    members: members.filter(member => post.memberIds.includes(member.userId)),
  }));
}

export default function TeamPage({ params }: PageProps) {
  const { project, isLoading } = useActiveProject();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!project) return;

    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        const membershipsRef = collection(db, 'project_memberships');
        const q = query(membershipsRef, where('projectId', '==', project.id));
        const querySnapshot = await getDocs(q);

        const membersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProjectMember[];

        setMembers(membersData);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [project]);

  if (isLoading || loadingMembers) {
    return <div>Chargement...</div>;
  }

  if (!project) {
    return <div>Projet non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Équipe du projet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center space-x-4">
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={`${member.firstname} ${member.lastname}`}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl text-gray-600">
                    {member.firstname[0]}{member.lastname[0]}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium">{member.firstname} {member.lastname}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm">
                <span className="text-gray-500">Email:</span> {member.email}
              </p>
              {member.phone && (
                <p className="text-sm">
                  <span className="text-gray-500">Téléphone:</span> {member.phone}
                </p>
              )}
              <p className="text-sm">
                <span className="text-gray-500">Statut:</span>{' '}
                <span className={`${member.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                  {member.status === 'approved' ? 'Approuvé' : 'En attente'}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <Button variant="primary" size="default" onClick={() => setModalOpen(true)}>
        Ajouter un poste
      </Button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un poste">
        <AddRoleFlow
          projectId={project.id}
          onSuccess={() => {
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
} 