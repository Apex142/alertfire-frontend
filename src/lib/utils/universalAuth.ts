import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Capacitor } from "@capacitor/core";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword as webCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as webSendPasswordResetEmail,
  signInWithEmailAndPassword as webSignInWithEmailAndPassword,
  signOut as webSignOut,
} from "firebase/auth";
import { auth } from "../firebase/client";

const isNative = () =>
  Capacitor.isNativePlatform && Capacitor.isNativePlatform();

// --- SIGN IN WITH GOOGLE ---
export async function signInWithGoogleUniversal(): Promise<{
  user: any;
  credential: any;
}> {
  if (isNative()) {
    const result = await FirebaseAuthentication.signInWithGoogle();
    return { user: result.user, credential: result.credential };
  } else {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user, credential: userCredential };
  }
}

// --- SIGN IN WITH EMAIL ---
export async function signInWithEmailUniversal(
  email: string,
  password: string
) {
  if (isNative()) {
    const result = await FirebaseAuthentication.signInWithEmailAndPassword({
      email,
      password,
    });
    return { user: result.user, credential: result };
  } else {
    const userCredential = await webSignInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, credential: userCredential };
  }
}

// --- SIGN UP EMAIL ---
export async function signUpWithEmailUniversal(
  email: string,
  password: string
) {
  if (isNative()) {
    const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
      email,
      password,
    });
    return { user: result.user, credential: result };
  } else {
    const userCredential = await webCreateUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, credential: userCredential };
  }
}

// --- SIGN OUT ---
export async function signOutUniversal() {
  if (isNative()) {
    await FirebaseAuthentication.signOut();
  } else {
    await webSignOut(auth);
  }
}

// --- PASSWORD RESET ---
export async function sendPasswordResetUniversal(email: string) {
  if (isNative()) {
    await FirebaseAuthentication.sendPasswordResetEmail({ email });
  } else {
    await webSendPasswordResetEmail(auth, email);
  }
}

// --- GET CURRENT USER ---
export async function getCurrentUserUniversal() {
  if (isNative()) {
    const result = await FirebaseAuthentication.getCurrentUser();
    return result.user;
  } else {
    return auth.currentUser;
  }
}
