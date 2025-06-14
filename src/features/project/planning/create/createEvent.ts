import { db } from "@/lib/firebase/client";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

interface EventMember {
  userId: string;
  role: string;
}

interface CreateEventData {
  projectId: string;
  title: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  locationLabel?: string;
  locationAddress?: string;
  members?: EventMember[];
  notifyMembers: boolean;
}

// Fonction fictive pour la notification des membres
const notifyUsers = (members: EventMember[]) => {
  if (members.length > 0) {
    console.log("Notification envoyée aux membres:", members);
  }
};

export const createEvent = async (data: CreateEventData): Promise<string> => {
  try {
    // Générer un ID unique pour l'événement
    const eventsRef = collection(db, `projects/${data.projectId}/events`);
    const eventId = doc(eventsRef).id;

    // S'assurer que members est initialisé
    const members = data.members || [];

    // Créer le document de l'événement
    const eventData = {
      id: eventId,
      title: data.title,
      eventType: data.eventType,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      locationId: data.locationId,
      members: members,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Ajouter l'événement dans Firestore
    await setDoc(
      doc(db, `projects/${data.projectId}/events/${eventId}`),
      eventData
    );

    // Si un nouveau lieu est créé, l'ajouter à la collection des lieux
    if (data.locationLabel && data.locationAddress) {
      // Créer le lieu dans la collection globale
      const locationData = {
        id: data.locationId,
        label: data.locationLabel,
        address: data.locationAddress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Créer le lieu dans la collection globale
      await setDoc(doc(db, "locations", data.locationId), locationData);

      // Créer la référence du lieu dans le project
      await setDoc(
        doc(
          db,
          "projects",
          data.projectId,
          "projectLocations",
          data.locationId
        ),
        {
          locationId: data.locationId,
          addedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
    }

    // Notifier les membres si demandé et s'il y en a
    if (data.notifyMembers && members.length > 0) {
      notifyUsers(members);
    }

    return eventId;
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    throw new Error("Impossible de créer l'événement");
  }
};
