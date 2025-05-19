import { Card } from '@/components/ui/Card';
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { ProjectMember, Post } from '@/stores/useProjectData';

interface RoleCardProps {
  post: Post;
  members: ProjectMember[];
}

const statusColors = {
  'approved': 'bg-green-100 text-green-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'rejected': 'bg-red-100 text-red-800',
};

// Fonction utilitaire pour convertir n'importe quel format en Date
const getDate = (d: Timestamp | Date | string | undefined) => {
  if (!d) return undefined;
  if (typeof d === 'string') return new Date(d);
  if (d instanceof Date) return d;
  if (typeof d === 'object' && 'toDate' in d && typeof d.toDate === 'function') return d.toDate();
  return undefined;
};

export default function RoleCard({ post, members }: RoleCardProps) {
  // Fonction pour obtenir les initiales
  const getInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName?.[0]?.toUpperCase() || '';
    const lastInitial = lastName?.[0]?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const getStatusColor = (status: ProjectMember['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ProjectMember['status']) => {
    switch (status) {
      case 'approved':
        return 'Accepté';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Refusé';
      case 'declined':
        return 'Décliné';
      default:
        return status;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* En-tête du poste */}
      <div className="flex items-center gap-2 mb-2">
        {post.icon && <img src={post.icon} alt="" className="w-6 h-6" />}
        <h2 className="font-semibold text-lg">{post.title}</h2>
      </div>
      {/* Liste des membres */}
      <div className="space-y-4">
        {members.length === 0 && (
          <div className="text-gray-400 italic">Aucun membre pour ce poste</div>
        )}
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-4">
            {/* Photo de profil */}
            <div className="flex-shrink-0">
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={`${member.firstname} ${member.lastname}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-blue-600">
                    {getInitials(member.firstname, member.lastname)}
                  </span>
                </div>
              )}
            </div>
            {/* Informations */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-lg truncate">
                  {member.firstname} {member.lastname}
                </h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(member.status)}`}>
                  {getStatusText(member.status)}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {member.role?.toUpperCase()}
                  </span>
                  <p className="truncate">
                    {member.email} • {member.phone && member.phone}
                  </p>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex-shrink-0 flex gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 