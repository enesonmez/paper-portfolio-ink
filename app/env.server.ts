import type { AppDb } from "../db";
import type { AnalyticsRuntimeConfig } from "./shared/analytics/config";
import type { AppDataCache } from "./shared/cache/data-cache.server";
import type { AuthRuntimeConfig } from "./shared/auth/auth-config";
import type { AppRuntimeContext } from "./runtime.server";

declare module "react-router" {
  interface AppLoadContext {
    analytics?: Partial<AnalyticsRuntimeConfig>;
    auth?: Partial<AuthRuntimeConfig>;
    cache?: AppDataCache;
    db: AppDb;
    runtime: AppRuntimeContext;
  }
}

export {};
