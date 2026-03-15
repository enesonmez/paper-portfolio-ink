import type { AppDb } from "../db";
import type { AppRuntimeContext } from "./runtime.server";

declare module "react-router" {
  interface AppLoadContext {
    db: AppDb;
    runtime: AppRuntimeContext;
  }
}

export {};
