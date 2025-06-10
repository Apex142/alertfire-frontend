// src/lib/firebase/client.ts
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== "undefined" && !getApps().length) {
  // Nous sommes côté client et Firebase n'a pas encore été initialisé.
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else if (getApps().length > 0) {
  // Firebase a déjà été initialisé (peut arriver avec HMR ou si ce module est importé plusieurs fois)
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // Nous sommes potentiellement côté serveur et aucune app n'est initialisée.
  // Cela ne devrait pas arriver pour le client SDK, mais par sécurité :
  // Initialiser une app par défaut si firebaseConfig est disponible.
  // Cependant, ce module est destiné au client.
  // Pour le SSR/Server Components, privilégiez `admin.ts`.
  // Si vous avez besoin d'une instance client sur le serveur dans des cas très spécifiques (non admin),
  // il faudrait une logique plus robuste ici, mais c'est rare.
  // On initialise quand même pour éviter des erreurs si ce module est importé par erreur côté serveur
  // sans que `window` soit défini (ex: dans un environnement de test Node.js sans JSDOM complet).
  app = initializeApp(firebaseConfig); // Peut nécessiter des ajustements si `firebaseConfig` n'est pas défini ici
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
