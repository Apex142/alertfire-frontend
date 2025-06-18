// src/lib/firebase/client.ts
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Capacitor } from "@capacitor/core";

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth, // Web-only
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

import { firebaseConfig } from "./config";

/* -------------------------------------------------------------------------- */
/* 1. Initialisation unique de l’App                                          */
/* -------------------------------------------------------------------------- */
let app: FirebaseApp;

if (!getApps().length) {
  // Première initialisation (client web, mobile natif ou tests)
  app = initializeApp(firebaseConfig);
} else {
  // Déjà initialisé (HMR, import multiple, etc.)
  app = getApp();
}

/* -------------------------------------------------------------------------- */
/* 2. Services communs (Firestore, Storage)                                   */
/* -------------------------------------------------------------------------- */
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

/* -------------------------------------------------------------------------- */
/* 3. Authentification                                                        */
/*    - Web  : SDK firebase/auth                                              */
/*    - Natif: Plugin @capacitor-firebase/authentication                      */
/* -------------------------------------------------------------------------- */
const isNative = Capacitor.isNativePlatform();

/**
 * Sur le **web**, on garde l’Auth SDK classique pour profiter
 * de ses méthodes (onAuthStateChanged, etc.).
 *
 * Sur **mobile natif**, on ne crée PAS d’instance `Auth` :
 * on utilisera **exclusivement** `FirebaseAuthentication`.
 */
const auth: Auth | null = !isNative ? getAuth(app) : null;

/* -------------------------------------------------------------------------- */
/* 4. Exports                                                                 */
/* -------------------------------------------------------------------------- */
export { app, auth, db, storage };
export const nativeAuth = FirebaseAuthentication; // Facade natif (toujours exportée)
