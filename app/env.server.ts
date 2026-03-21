import type { AppDb } from "../db";
import type { AppDataCache } from "./lib/cache/data-cache.server";
import type { AuthRuntimeConfig } from "./lib/auth/auth-config";
import type { AppRuntimeContext } from "./runtime.server";

declare module "react-router" {
  interface AppLoadContext {
    auth?: Partial<AuthRuntimeConfig>;
    cache?: AppDataCache;
    db: AppDb;
    runtime: AppRuntimeContext;
  }
}

export {};
