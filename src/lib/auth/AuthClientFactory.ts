// pkg/lib/auth/AuthClientFactory.ts
import { Capacitor } from "@capacitor/core";
import { IAuthClient } from "./IAuthClient";
import { NativeAuthClient } from "./NativeAuthClient";
import { WebAuthClient } from "./WebAuthClient";

export const authClient: IAuthClient = Capacitor.isNativePlatform()
  ? new NativeAuthClient()
  : new WebAuthClient();
