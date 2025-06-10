// src/app/api/auth/session/route.ts
import { adminAuth } from "@/lib/firebase/admin"; // Votre initialisation Firebase Admin SDK
import { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "__session"; // Nom du cookie de session
// Durée de vie du cookie de session (par exemple, 14 jours).
// Les ID Tokens Firebase expirent après 1 heure, mais le cookie de session peut durer plus longtemps.
// Firebase Admin SDK gère la validité du session cookie.
const SESSION_COOKIE_EXPIRES_IN_MS = 60 * 60 * 24 * 14 * 1000; // 14 jours en millisecondes

/**
 * Gère la création et la suppression des cookies de session HttpOnly.
 */
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { action, token } = requestBody; // 'token' est l'ID Token Firebase du client

    if (!action) {
      return NextResponse.json(
        { error: "Action non spécifiée." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const options = {
      name: SESSION_COOKIE_NAME,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // True en production
      path: "/",
      sameSite: "lax" as const, // 'lax' est un bon équilibre, 'strict' est plus restrictif
    };

    if (action === "login") {
      if (!token) {
        return NextResponse.json(
          { error: "ID Token manquant pour le login." },
          { status: 400 }
        );
      }
      // Créer le cookie de session. expiresIn doit être en millisecondes.
      const sessionCookie = await adminAuth.createSessionCookie(token, {
        expiresIn: SESSION_COOKIE_EXPIRES_IN_MS,
      });

      cookieStore.set({
        ...options,
        value: sessionCookie,
        maxAge: SESSION_COOKIE_EXPIRES_IN_MS / 1000, // maxAge est en secondes
      });

      console.log("API /api/auth/session: Session cookie créé.");
      return NextResponse.json(
        { status: "success", message: "Session créée." },
        { status: 200 }
      );
    } else if (action === "logout") {
      const sessionCookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (sessionCookieValue) {
        try {
          // Cela invalide toutes les sessions pour cet utilisateur.
          const decodedClaims = await adminAuth
            .verifySessionCookie(
              sessionCookieValue,
              true /* checkForRevocation */
            )
            .catch(() => null); // Ignorer l'erreur si le cookie est déjà invalide

          if (decodedClaims) {
            await adminAuth.revokeRefreshTokens(decodedClaims.sub); // sub est l'UID de l'utilisateur
            console.log(
              `API /api/auth/session: Refresh tokens révoqués pour l'UID ${decodedClaims.sub}.`
            );
          }
        } catch (error) {
          // Ne pas bloquer la suppression du cookie si la révocation échoue
          console.error(
            "API /api/auth/session: Erreur lors de la révocation des refresh tokens:",
            error
          );
        }
      }

      // Supprimer le cookie de session
      cookieStore.set({
        ...options,
        value: "",
        maxAge: 0, // ou -1 pour suppression immédiate
        expires: new Date(0), // Date dans le passé
      });

      console.log("API /api/auth/session: Session cookie supprimé.");
      return NextResponse.json(
        { status: "success", message: "Session terminée." },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Action non valide." }, { status: 400 });
  } catch (error: any) {
    console.error("API /api/auth/session POST Error:", error);
    // Éviter de divulguer des détails d'erreur sensibles
    return NextResponse.json(
      { error: "Erreur interne du serveur lors du traitement de la session." },
      { status: 500 }
    );
  }
}

/**
 * Vérifie le statut de la session actuelle basée sur le cookie HttpOnly.
 * Utile pour les Server Components ou pour hydrater l'état d'authentification initial.
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookieValue) {
    // Pas de cookie, donc pas de session active côté serveur
    return NextResponse.json(
      { isAuthenticated: false, user: null },
      { status: 200 }
    );
  }

  try {
    // Vérifier le cookie de session. Le second argument `true` vérifie s'il a été révoqué.
    const decodedClaims: DecodedIdToken = await adminAuth.verifySessionCookie(
      sessionCookieValue,
      true
    );

    // La session est valide. Retourner les informations utilisateur du token.
    // Vous pourriez enrichir ces informations en récupérant le profil AppUser depuis Firestore ici si nécessaire.
    const { uid, email, name, picture, email_verified, phone_number } =
      decodedClaims;
    const user = {
      uid,
      email,
      displayName: name,
      photoURL: picture,
      emailVerified: email_verified,
      phoneNumber: phone_number,
    };

    console.log("API /api/auth/session GET: Session valide pour UID:", uid);
    return NextResponse.json({ isAuthenticated: true, user }, { status: 200 });
  } catch (error: any) {
    // Le cookie de session est invalide (expiré, révoqué, malformé, etc.).
    console.warn(
      "API /api/auth/session GET: Erreur de vérification du cookie de session:",
      error.code || error.message
    );

    // Il est bon de supprimer le cookie invalide du navigateur
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax" as const,
      expires: new Date(0),
    });

    return NextResponse.json(
      {
        isAuthenticated: false,
        user: null,
        error: "Session invalide ou expirée.",
      },
      { status: 200 }
    ); // ou 401 si vous préférez
  }
}
