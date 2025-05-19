import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CreateRoleParams {
  userId: string;
  projectId: string;
  role: any;
  linkType: 'project' | 'events';
  selectedEvents?: string[];
  status?: 'approved' | 'pending' | 'rejected' | 'declined';
}

// Nouvelle fonction pour créer un post
export async function createPost({ projectId, postData }: { projectId: string, postData: any }) {
  const postsRef = collection(db, `projects/${projectId}/posts`);
  const docRef = await addDoc(postsRef, {
    ...postData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

// Fonction pour créer le membership (appelée seulement si technicien sélectionné)
export async function createMembership({
  userId,
  projectId,
  role,
  linkType,
  selectedEvents = [],
  status = 'pending'
}: CreateRoleParams) {
  let membershipId = null;

  // Cherche le project_membership pour ce technicien (ou id temporaire) et ce projet
  const q = query(
    collection(db, 'project_memberships'),
    where('userId', '==', userId),
    where('projectId', '==', projectId)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    membershipId = snap.docs[0].id;
  } else {
    // Récupère les informations de l'utilisateur
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    // Crée le membership si inexistant
    const docRef = await addDoc(collection(db, 'project_memberships'), {
      userId,
      projectId,
      role: role?.label || 'Technicien',
      status,
      isGlobal: linkType === 'project',
      eventIds: linkType === 'events' ? selectedEvents : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ajout des informations utilisateur
      firstname: userData?.firstName || '',
      lastname: userData?.lastName || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      photo_url: userData?.photoURL || '',
    });
    membershipId = docRef.id;
  }

  // Si le rôle est lié à des événements spécifiques
  if (linkType === 'events' && selectedEvents.length > 0 && membershipId) {
    for (const eventId of selectedEvents) {
      const eventRef = doc(db, `projects/${projectId}/events/${eventId}`);
      await updateDoc(eventRef, {
        members: arrayUnion(membershipId)
      });
    }
  }

  return membershipId;
} 