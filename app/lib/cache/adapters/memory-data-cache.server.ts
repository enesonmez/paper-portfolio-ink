import type { z } from "zod";

import type { AppDataCache } from "../contracts";

const NODE_DATA_CACHE_GLOBAL_KEY = "__paper_portfolio_ink_node_data_cache__";

interface MemoryCacheEntry {
  expiresAt: number;
  value: unknown;
}

async function parseCachedValue<T>(schema: z.ZodType<T>, value: unknown) {
  const parsed = await schema.safeParseAsync(value);

  return parsed.success ? parsed.data : null;
}

function getSharedNodeCacheStore() {
  const globalScope = globalThis as typeof globalThis & {
    [NODE_DATA_CACHE_GLOBAL_KEY]?: Map<string, MemoryCacheEntry>;
  };

  if (!globalScope[NODE_DATA_CACHE_GLOBAL_KEY]) {
    globalScope[NODE_DATA_CACHE_GLOBAL_KEY] = new Map<string, MemoryCacheEntry>();
  }

  return globalScope[NODE_DATA_CACHE_GLOBAL_KEY];
}

function cloneCacheValue<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return value;
}

export function createMemoryDataCache(
  store: Map<string, MemoryCacheEntry> = getSharedNodeCacheStore(),
): AppDataCache {
  return {
    delete(key) {
      return Promise.resolve(store.delete(key));
    },
    async get(key, schema) {
      const entry = store.get(key);

      if (!entry) {
        return null;
      }

      if (entry.expiresAt <= Date.now()) {
        store.delete(key);

        return null;
      }

      const parsed = await parseCachedValue(schema, cloneCacheValue(entry.value));

      if (!parsed) {
        store.delete(key);
      }

      return parsed;
    },
    set(key, value, options) {
      store.set(key, {
        expiresAt: Date.now() + options.maxAgeSeconds * 1000,
        value: cloneCacheValue(value),
      });

      return Promise.resolve();
    },
  };
}
