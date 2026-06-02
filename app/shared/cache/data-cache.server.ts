import type { ZodType } from "zod";

import type { AppRuntimeContext } from "~/runtime.server";
import { createMemoryDataCache } from "./adapters/memory-data-cache.server";
export { createCloudflareDataCache } from "./adapters/cloudflare-data-cache.server";
export { createMemoryDataCache } from "./adapters/memory-data-cache.server";
export type {
  AppDataCache,
  AppDataCacheStrategy,
  CloudflareCacheStore,
  DataCacheWriteOptions,
} from "./contracts";
import type {
  AppDataCache,
  AppDataCacheStrategy,
  DataCacheWriteOptions,
} from "./contracts";

interface DataCacheContextShape {
  cache?: AppDataCache;
  runtime?: AppRuntimeContext;
}
const noopDataCache: AppDataCache = {
  delete() {
    return Promise.resolve(false);
  },
  get() {
    return Promise.resolve(null);
  },
  set() {
    return Promise.resolve();
  },
};

const sharedNodeDataCache = createMemoryDataCache();

export function getAppDataCache(context: DataCacheContextShape): AppDataCache {
  const strategy = getAppDataCacheStrategy(context);

  if (strategy === "cloudflare") {
    return context.cache ?? noopDataCache;
  }

  if (strategy === "memory") {
    return sharedNodeDataCache;
  }

  return noopDataCache;
}

export function getAppDataCacheStrategy(
  context: DataCacheContextShape,
): AppDataCacheStrategy {
  if (context.cache) {
    return "cloudflare";
  }

  if (context.runtime?.platform === "node") {
    return "memory";
  }

  return "none";
}

interface LoadCachedDataArgs<T> {
  context: DataCacheContextShape;
  key: string;
  load: () => Promise<T>;
  options: DataCacheWriteOptions;
  schema: ZodType<T>;
}

export async function loadCachedData<T>({
  context,
  key,
  load,
  options,
  schema,
}: LoadCachedDataArgs<T>) {
  const cache = getAppDataCache(context);
  const cached = await cache.get(key, schema);

  if (cached) {
    return cached;
  }

  const value = await load();

  await cache.set(key, value, options);

  return value;
}

export async function invalidateCachedData(
  context: DataCacheContextShape,
  key: string,
) {
  return getAppDataCache(context).delete(key);
}
