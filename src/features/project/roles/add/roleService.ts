import { db } from "@/lib/firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

interface CreateRoleParams {
  userId: string;
  projectId: string;
  role: any;
  linkType: "project" | "events";
  selectedEvents?: string[];
  status?: "approved" | "pending" | "rejected" | "declined";
}

interface CreateNotificationParams {
  userId: string; // destinataire
  projectId: string; // ID du project concerné
  message: string; // message affiché
  type?: string; // ex: 'project_invite'
  context?: Record<string, any>; // données supplémentaires facultatives
}

/**
 * Crée une notification pour un utilisateur
 */
export async function createNotification({
  userId,
  projectId,
  message,
  type = "project_invite",
  context = {},
}: CreateNotificationParams): Promise<string> {
  const docRef = await addDoc(collection(db, "notifications"), {
    userId,
    projectId,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
    ...context,
  });

  return docRef.id;
}

// Nouvelle fonction pour créer un post
export async function createPost({
  projectId,
  postData,
}: {
  projectId: string;
  postData: any;
}): Promise<string> {
  const { memberIds } = postData;

  // Vérifie que memberIds existe et n'est pas vide
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    throw new Error(
      "Le champ 'memberIds' est requis et ne peut pas être vide."
    );
  }

  // Vérifie que chaque userId existe dans la collection 'users'
  for (const userId of memberIds) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error(`L'utilisateur avec l'ID '${userId}' n'existe pas.`);
    }
  }

  // Ajout du post
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
  status = "pending",
}: CreateRoleParams) {
  let membershipId = null;

  // Cherche le project_membership pour ce technicien (ou id temporaire) et ce project
  const q = query(
    collection(db, "project_memberships"),
    where("userId", "==", userId),
    where("projectId", "==", projectId)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    membershipId = snap.docs[0].id;
  } else {
    // Récupère les informations de l'utilisateur
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();

    // Crée le membership si inexistant
    const docRef = await addDoc(collection(db, "project_memberships"), {
      userId,
      projectId,
      role: role?.label || "Technicien",
      status,
      isGlobal: linkType === "project",
      eventIds: linkType === "events" ? selectedEvents : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ajout des informations utilisateur
      firstname: userData?.firstName || "",
      lastname: userData?.lastName || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      photo_url: userData?.photoURL || "",
    });
    membershipId = docRef.id;
  }

  // Si le rôle est lié à des événements spécifiques
  if (linkType === "events" && selectedEvents.length > 0 && membershipId) {
    for (const eventId of selectedEvents) {
      const eventRef = doc(db, `projects/${projectId}/events/${eventId}`);
      await updateDoc(eventRef, {
        members: arrayUnion(membershipId),
      });
    }
  }

  return membershipId;
}
