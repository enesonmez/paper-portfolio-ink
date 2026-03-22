import type {
  Cache as CloudflareCache,
  Response as CloudflareResponse,
} from "@cloudflare/workers-types";

import type { CloudflareCacheStore } from "../app/shared/cache/contracts";

export function createCloudflareCacheStore(
  cache: CloudflareCache,
): CloudflareCacheStore {
  return {
    delete(key) {
      return cache.delete(key);
    },
    async get(key) {
      const response = await cache.match(key);

      return response ? response.text() : null;
    },
    set(key, value, cacheControl) {
      const cachedResponse = new Response(value, {
        headers: {
          "Cache-Control": cacheControl,
          "Content-Type": "application/json; charset=utf-8",
        },
      }) as unknown as CloudflareResponse;

      return cache.put(key, cachedResponse);
    },
  };
}
