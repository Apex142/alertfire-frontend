import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { EventFormData } from '../CreateEventForm';

interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  photo_url?: string;
  status: 'approved' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

interface EventMember {
  userId: string;
  role: string;
}

interface ParticipantsStepProps {
  data: EventFormData;
  updateData: (data: Partial<EventFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  projectId: string;
}

export default function ParticipantsStep({ data, updateData, onNext, onBack, projectId }: ParticipantsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les membres du projet
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const membershipsRef = collection(db, 'project_memberships');
        const q = query(
          membershipsRef,
          where('projectId', '==', projectId),
          where('status', '==', 'approved')
        );
        const querySnapshot = await getDocs(q);

        const membersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as ProjectMember[];

        setMembers(membersData);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [projectId]);

  // S'assurer que members est initialisé
  useEffect(() => {
    if (!data.members) {
      updateData({ members: [] });
    }
  }, [data.members, updateData]);

  const validate = () => {
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const toggleMember = (member: ProjectMember) => {
    const currentMembers = data.members || [];
    const memberExists = currentMembers.some(m => m.userId === member.userId);

    const newMembers = memberExists
      ? currentMembers.filter(m => m.userId !== member.userId)
      : [...currentMembers, { userId: member.userId, role: member.role }];

    updateData({ members: newMembers });
  };

  const isMemberAssigned = (member: ProjectMember) => {
    return (data.members || []).some(m => m.userId === member.userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner les participants (optionnel)
        </label>
        <div className="border rounded-lg divide-y">
          {members.map(member => {
            const isAssigned = isMemberAssigned(member);
            return (
              <div
                key={member.id}
                className={`flex items-center p-4 hover:bg-gray-50 ${isAssigned ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center flex-1">
                  <div className="flex-shrink-0">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={`${member.firstname} ${member.lastname}`}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAssigned ? 'bg-gray-300' : 'bg-gray-200'
                        }`}>
                        <span className={`text-sm font-medium ${isAssigned ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                          {member.firstname[0]}{member.lastname[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={`font-medium ${isAssigned ? 'text-gray-500' : ''}`}>
                      {member.firstname} {member.lastname}
                    </div>
                    <div className={`text-sm ${isAssigned ? 'text-gray-400' : 'text-gray-500'}`}>
                      {member.role}
                    </div>
                  </div>
                </div>
                <Checkbox
                  checked={isAssigned}
                  onChange={() => toggleMember(member)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="notify_members"
          checked={data.notify_members || false}
          onChange={(e) => updateData({ notify_members: e.target.checked })}
        />
        <label htmlFor="notify_members" className="text-sm text-gray-700">
          Notifier les participants par email
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Retour
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
} 