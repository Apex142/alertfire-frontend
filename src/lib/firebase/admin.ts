// src/lib/firebase/admin.ts (Rappel de la structure)
import * as admin from "firebase-admin";

// Ces variables d'environnement doivent être définies dans votre .env.local
// et NE PAS être préfixées par NEXT_PUBLIC_
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Gérer les sauts de ligne pour Vercel/autres
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
// export const adminStorage = admin.storage(); // Si vous utilisez Storage avec Admin SDK
