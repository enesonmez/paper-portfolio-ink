import type { AppLoadContext } from "react-router";

import {
  buildConfigurationCacheKey,
  loadAccountConfigurationParameters,
  purgeAccountConfigurationCache,
} from "~/lib/configuration/configuration.server";
import { ACCOUNT_CONFIGURATION_KEYS } from "~/domain/configuration/model";
import { buildPublicBlogCacheKey } from "~/features/public/blog/data/cache";
import { loadPublicBlogData } from "~/features/public/blog/data/loader.server";
import { purgePublicBlogDataCache } from "~/features/public/blog/server";
import { buildPublicHomeCacheKey } from "~/features/public/home/data/cache";
import { loadPublicHomeData } from "~/features/public/home/data/loader.server";
import { purgePublicHomeDataCache } from "~/features/public/home/server";
import { buildPublicProjectsCacheKey } from "~/features/public/projects/data/cache";
import { loadPublicProjectsData } from "~/features/public/projects/data/loader.server";
import { purgePublicProjectsDataCache } from "~/features/public/projects/server";
import type { AuthorizationActor } from "~/shared/authz/actor";
import {
  bumpAuthorizationRevision,
  getAuthorizationRevision,
  warmAuthorizationActorClaimsCache,
} from "~/shared/authz/resolver.server";
import { getAppDataCacheStrategy } from "~/shared/cache/data-cache.server";
import {
  buildI18nCacheKey,
  buildSupportedLocalesCacheKey,
  loadSupportedLocales,
  purgeI18nDataCache,
  warmI18nDataCache,
} from "~/shared/i18n/i18n.server";

import {
  RUNTIME_CACHE_ENTRY,
  RUNTIME_CACHE_SCOPE,
  RUNTIME_CACHE_VALUE_KIND,
  type DashboardSettingsRuntimeCacheEntry,
  type RuntimeCacheEntryId,
} from "../runtime/state";

function buildI18nPatternKey(request: Request, sampleLocale: string) {
  return `${buildSupportedLocalesCacheKey(request)} + ${buildI18nCacheKey(
    request,
    sampleLocale,
  ).replace(new RegExp(`/${sampleLocale}$`), "/*")}`;
}

function getCacheStrategy(context: Pick<AppLoadContext, "cache" | "runtime">) {
  return getAppDataCacheStrategy(context);
}

export async function listRuntimeCacheEntries(args: {
  actor: AuthorizationActor;
  context: AppLoadContext;
  request: Request;
}): Promise<readonly DashboardSettingsRuntimeCacheEntry[]> {
  const strategy = getCacheStrategy(args.context);
  const supportedLocales = await loadSupportedLocales(args.context, args.request);
  const revision = await getAuthorizationRevision(args.context);
  const i18nSampleLocale = supportedLocales[0]?.code ?? "tr";

  return [
    {
      cacheKey: buildConfigurationCacheKey(args.request),
      id: RUNTIME_CACHE_ENTRY.configuration,
      scope: RUNTIME_CACHE_SCOPE.global,
      strategy,
      value: ACCOUNT_CONFIGURATION_KEYS.length,
      valueKind: RUNTIME_CACHE_VALUE_KIND.keys,
      warmScope: RUNTIME_CACHE_SCOPE.global,
    },
    {
      cacheKey: buildI18nPatternKey(args.request, i18nSampleLocale),
      id: RUNTIME_CACHE_ENTRY.i18n,
      scope: RUNTIME_CACHE_SCOPE.locale,
      strategy,
      value: supportedLocales.length,
      valueKind: RUNTIME_CACHE_VALUE_KIND.locales,
      warmScope: RUNTIME_CACHE_SCOPE.locale,
    },
    {
      cacheKey: buildPublicHomeCacheKey(args.request),
      id: RUNTIME_CACHE_ENTRY.publicHome,
      scope: RUNTIME_CACHE_SCOPE.page,
      strategy,
      value: 1,
      valueKind: RUNTIME_CACHE_VALUE_KIND.page,
      warmScope: RUNTIME_CACHE_SCOPE.page,
    },
    {
      cacheKey: buildPublicProjectsCacheKey(args.request),
      id: RUNTIME_CACHE_ENTRY.publicProjects,
      scope: RUNTIME_CACHE_SCOPE.page,
      strategy,
      value: 1,
      valueKind: RUNTIME_CACHE_VALUE_KIND.page,
      warmScope: RUNTIME_CACHE_SCOPE.page,
    },
    {
      cacheKey: buildPublicBlogCacheKey(args.request),
      id: RUNTIME_CACHE_ENTRY.publicBlog,
      scope: RUNTIME_CACHE_SCOPE.page,
      strategy,
      value: 1,
      valueKind: RUNTIME_CACHE_VALUE_KIND.page,
      warmScope: RUNTIME_CACHE_SCOPE.page,
    },
    {
      cacheKey: `${new URL("/__cache/authz/", args.request.url).toString()}*`,
      id: RUNTIME_CACHE_ENTRY.authz,
      scope: RUNTIME_CACHE_SCOPE.actor,
      strategy,
      value: revision ?? 0,
      valueKind: RUNTIME_CACHE_VALUE_KIND.revision,
      warmScope: RUNTIME_CACHE_SCOPE.actor,
    },
  ] as const;
}

export async function refreshRuntimeCacheEntry(args: {
  actor: AuthorizationActor;
  cacheId: RuntimeCacheEntryId;
  context: AppLoadContext;
  request: Request;
}) {
  switch (args.cacheId) {
    case RUNTIME_CACHE_ENTRY.configuration:
      await purgeAccountConfigurationCache(args.context, args.request);
      await loadAccountConfigurationParameters(args.context, args.request);
      return;
    case RUNTIME_CACHE_ENTRY.i18n: {
      const supportedLocales = await loadSupportedLocales(args.context, args.request);
      const localeCodes = supportedLocales.map((locale) => locale.code);
      await purgeI18nDataCache(args.context, args.request, localeCodes);
      await warmI18nDataCache(args.context, args.request, localeCodes);
      return;
    }
    case RUNTIME_CACHE_ENTRY.publicHome:
      await purgePublicHomeDataCache(args.context, args.request);
      await loadPublicHomeData(args.context, args.request);
      return;
    case RUNTIME_CACHE_ENTRY.publicProjects:
      await purgePublicProjectsDataCache(args.context, args.request);
      await loadPublicProjectsData(args.context, args.request);
      return;
    case RUNTIME_CACHE_ENTRY.publicBlog:
      await purgePublicBlogDataCache(args.context, args.request);
      await loadPublicBlogData(args.context, args.request);
      return;
    case RUNTIME_CACHE_ENTRY.authz:
      await bumpAuthorizationRevision(args.context);
      if (args.actor.userId && args.actor.role) {
        await warmAuthorizationActorClaimsCache({
          authzVersion: args.actor.authzVersion,
          context: args.context,
          request: args.request,
          role: args.actor.role,
          userId: args.actor.userId,
        });
      }
      return;
  }
}
