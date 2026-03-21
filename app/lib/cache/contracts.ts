import type { z } from "zod";

export interface DataCacheWriteOptions {
  maxAgeSeconds: number;
  staleWhileRevalidateSeconds?: number;
}

export interface AppDataCache {
  delete(key: string): Promise<boolean>;
  get<T>(key: string, schema: z.ZodType<T>): Promise<T | null>;
  set(key: string, value: unknown, options: DataCacheWriteOptions): Promise<void>;
}

export interface CloudflareCacheStore {
  delete(key: string): Promise<boolean>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, cacheControl: string): Promise<void>;
}
