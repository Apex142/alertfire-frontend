import { Capacitor } from "@capacitor/core";
import type { IAuthClient } from "./IAuthClient";
import { NativeAuthClient } from "./NativeAuthClient";
import { WebAuthClient } from "./WebAuthClient";

let _client: IAuthClient | null = null;

/** Retourne toujours la même instance (sync). */
export function createAuthClient(): IAuthClient | null {
  if (_client) return _client;

  if (typeof window === "undefined") return null; // SSR safety
  _client = Capacitor.isNativePlatform()
    ? new NativeAuthClient()
    : new WebAuthClient();

  return _client;
}
