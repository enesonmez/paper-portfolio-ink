import type { AppLoadContext } from "react-router";

import {
  createCloudflareDataCache,
  type CloudflareCacheStore,
} from "../app/lib/cache/data-cache.server";
import { createRuntimeContext } from "../app/runtime.server";
import { createAppDb } from "../db";
import { resolveCloudflareAuthConfig } from "./auth-env";
import type { CloudflareAppBindings } from "./bindings";

interface CreateCloudflareLoadContextOptions {
  cache?: CloudflareCacheStore;
  env: CloudflareAppBindings;
  request: Request;
}

export function createCloudflareLoadContext({
  cache,
  env,
  request,
}: CreateCloudflareLoadContextOptions): AppLoadContext {
  return {
    auth: resolveCloudflareAuthConfig(env, request),
    cache: cache ? createCloudflareDataCache(cache) : undefined,
    db: createAppDb(env),
    runtime: createRuntimeContext("cloudflare"),
  };
}
