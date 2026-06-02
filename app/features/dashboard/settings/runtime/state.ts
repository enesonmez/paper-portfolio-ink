import type { AppDataCacheStrategy } from "~/shared/cache/data-cache.server";

export const RUNTIME_CACHE_ENTRY = {
  authz: "authz",
  configuration: "configuration",
  i18n: "i18n",
  publicBlog: "public-blog",
  publicHome: "public-home",
  publicProjects: "public-projects",
} as const;

export type RuntimeCacheEntryId =
  (typeof RUNTIME_CACHE_ENTRY)[keyof typeof RUNTIME_CACHE_ENTRY];

export const RUNTIME_CACHE_SCOPE = {
  actor: "actor",
  global: "global",
  locale: "locale",
  page: "page",
} as const;

export type RuntimeCacheScope =
  (typeof RUNTIME_CACHE_SCOPE)[keyof typeof RUNTIME_CACHE_SCOPE];

export const RUNTIME_CACHE_VALUE_KIND = {
  keys: "keys",
  locales: "locales",
  page: "page",
  revision: "revision",
} as const;

export type RuntimeCacheValueKind =
  (typeof RUNTIME_CACHE_VALUE_KIND)[keyof typeof RUNTIME_CACHE_VALUE_KIND];

export interface DashboardSettingsRuntimeCacheEntry {
  cacheKey: string;
  id: RuntimeCacheEntryId;
  scope: RuntimeCacheScope;
  strategy: AppDataCacheStrategy;
  value: number;
  valueKind: RuntimeCacheValueKind;
  warmScope: RuntimeCacheScope;
}

export interface DashboardSettingsRuntimeData {
  cacheEntries: readonly DashboardSettingsRuntimeCacheEntry[];
  platform: "cloudflare" | "node";
}
