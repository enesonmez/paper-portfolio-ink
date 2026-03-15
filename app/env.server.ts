import type { AppDb } from "../db";
import type { AuthRuntimeConfig } from "./lib/auth/auth-config";
import type { AppRuntimeContext } from "./runtime.server";

declare module "react-router" {
  interface AppLoadContext {
    auth?: Partial<AuthRuntimeConfig>;
    db: AppDb;
    runtime: AppRuntimeContext;
  }
}

export {};
