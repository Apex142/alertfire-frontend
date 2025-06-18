import { Capacitor } from "@capacitor/core";
import type { IAuthClient } from "./IAuthClient";

/**
 * Fabrique d’authClient – à appeler dans le navigateur.
 *
 * ⚠️  Renvoie `null` côté serveur pour éviter tout accès à `window`.
 */
export async function createAuthClient(): Promise<IAuthClient | null> {
  if (typeof window === "undefined") return null; // SSR safety ✅

  if (Capacitor.isNativePlatform()) {
    const { NativeAuthClient } = await import("./NativeAuthClient");
    return new NativeAuthClient();
  }

  const { WebAuthClient } = await import("./WebAuthClient");
  return new WebAuthClient();
}
