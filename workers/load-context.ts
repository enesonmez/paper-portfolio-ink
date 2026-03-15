import type { AppLoadContext } from "react-router";

import { createRuntimeContext } from "../app/runtime.server";
import { createAppDb } from "../db";
import { resolveCloudflareAuthConfig } from "./auth-env";
import type { CloudflareAppBindings } from "./bindings";

interface CreateCloudflareLoadContextOptions {
  env: CloudflareAppBindings;
  request: Request;
}

export function createCloudflareLoadContext({
  env,
  request,
}: CreateCloudflareLoadContextOptions): AppLoadContext {
  return {
    auth: resolveCloudflareAuthConfig(env, request),
    db: createAppDb(env),
    runtime: createRuntimeContext("cloudflare"),
  };
}
