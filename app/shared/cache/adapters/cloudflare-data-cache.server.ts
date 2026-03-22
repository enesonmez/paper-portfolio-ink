import type { z } from "zod";

import type {
  AppDataCache,
  CloudflareCacheStore,
  DataCacheWriteOptions,
} from "../contracts";

function buildCacheControl({
  maxAgeSeconds,
  staleWhileRevalidateSeconds,
}: DataCacheWriteOptions) {
  const directives = ["public", "max-age=0", `s-maxage=${maxAgeSeconds}`];

  if (typeof staleWhileRevalidateSeconds === "number") {
    directives.push(`stale-while-revalidate=${staleWhileRevalidateSeconds}`);
  }

  return directives.join(", ");
}

async function parseCachedValue<T>(schema: z.ZodType<T>, value: unknown) {
  const parsed = await schema.safeParseAsync(value);

  return parsed.success ? parsed.data : null;
}

export function createCloudflareDataCache(cache: CloudflareCacheStore): AppDataCache {
  return {
    async delete(key) {
      return cache.delete(key);
    },
    async get(key, schema) {
      const cachedPayload = await cache.get(key);

      if (!cachedPayload) {
        return null;
      }

      let payload: unknown;

      try {
        payload = JSON.parse(cachedPayload) as unknown;
      } catch {
        await cache.delete(key);

        return null;
      }

      const parsed = await parseCachedValue(schema, payload);

      if (!parsed) {
        await cache.delete(key);
      }

      return parsed;
    },
    async set(key, value, options) {
      await cache.set(key, JSON.stringify(value), buildCacheControl(options));
    },
  };
}
