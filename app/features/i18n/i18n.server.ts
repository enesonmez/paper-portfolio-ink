import { asc, eq } from "drizzle-orm";
import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../db/context";
import { locales, translations } from "../../../db/schema";
import { invalidateCachedData, loadCachedData } from "~/lib/cache/data-cache.server";
import { z } from "zod";

import {
  buildLocalizedPath,
  getDefaultLocale,
  getSeedLocaleOptions,
  getSeedMessages,
  mergeMessages,
  NORMALIZED_LOCALE_CODE_PATTERN,
  resolveRequestLocale,
  sanitizeLocalizedRedirectTarget,
  type AppLocale,
  type SupportedLocaleOption,
} from "./i18n.shared";
import type { TranslationKey } from "./messages.shared";

const translationRowSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

const translationsPayloadSchema = z.array(translationRowSchema);
const supportedLocaleSchema = z.object({
  code: z.string().trim().regex(NORMALIZED_LOCALE_CODE_PATTERN),
  isDefault: z.boolean(),
  label: z.string().trim().min(1),
});
const supportedLocalesSchema = z.array(supportedLocaleSchema);
const supportedLocalesRequestCache = new WeakMap<
  Request,
  Promise<SupportedLocaleOption[]>
>();
const localeRuntimeStateRequestCache = new WeakMap<
  Request,
  Promise<I18nRuntimeState>
>();

export interface AppI18nPayload {
  locale: AppLocale;
  messages: ReturnType<typeof getSeedMessages>;
  supportedLocales: SupportedLocaleOption[];
}

export interface I18nRuntimeState {
  defaultLocale: AppLocale;
  locale: AppLocale;
  supportedLocaleCodes: AppLocale[];
  supportedLocales: SupportedLocaleOption[];
}

function buildI18nCacheKey(request: Request, locale: AppLocale) {
  return new URL(`/__cache/i18n/${locale}`, request.url).toString();
}

function buildSupportedLocalesCacheKey(request: Request) {
  return new URL("/__cache/i18n/locales", request.url).toString();
}

function normalizeSupportedLocales(
  localesToNormalize: SupportedLocaleOption[],
): SupportedLocaleOption[] {
  if (localesToNormalize.length === 0) {
    return getSeedLocaleOptions();
  }

  const hasDefault = localesToNormalize.some((locale) => locale.isDefault);

  return localesToNormalize.map((locale, index) => ({
    ...locale,
    code: locale.code.toLowerCase(),
    isDefault: hasDefault ? locale.isDefault : index === 0,
  }));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "";
}

function isMissingI18nTableError(
  error: unknown,
  tableName: "locales" | "translations",
) {
  const message = getErrorMessage(error).toLowerCase();

  return message.includes("no such table") && message.includes(tableName);
}

async function listSupportedLocales(context: AppLoadContext) {
  const db = getDbFromContext(context);

  if (!("select" in db) || typeof db.select !== "function") {
    return getSeedLocaleOptions();
  }

  try {
    const rows = await db
      .select({
        code: locales.code,
        isDefault: locales.isDefault,
        label: locales.label,
      })
      .from(locales)
      .where(eq(locales.isActive, true))
      .orderBy(asc(locales.sortOrder), asc(locales.code));

    return normalizeSupportedLocales(supportedLocalesSchema.parse(rows));
  } catch (error) {
    if (isMissingI18nTableError(error, "locales")) {
      return getSeedLocaleOptions();
    }

    throw error;
  }
}

async function listTranslationsByLocale(context: AppLoadContext, locale: AppLocale) {
  const db = getDbFromContext(context);

  if (!("select" in db) || typeof db.select !== "function") {
    return translationsPayloadSchema.parse(
      Object.entries(getSeedMessages(locale)).map(([key, value]) => ({
        key,
        value,
      })),
    );
  }

  try {
    const rows = await db
      .select({
        key: translations.key,
        value: translations.value,
      })
      .from(translations)
      .where(eq(translations.locale, locale))
      .orderBy(asc(translations.key));

    return translationsPayloadSchema.parse(rows);
  } catch (error) {
    if (isMissingI18nTableError(error, "translations")) {
      return translationsPayloadSchema.parse(
        Object.entries(getSeedMessages(locale)).map(([key, value]) => ({
          key,
          value,
        })),
      );
    }

    throw error;
  }
}

export async function loadSupportedLocales(context: AppLoadContext, request: Request) {
  const cachedPromise = supportedLocalesRequestCache.get(request);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = loadCachedData({
    context,
    key: buildSupportedLocalesCacheKey(request),
    load: () => listSupportedLocales(context),
    options: {
      maxAgeSeconds: 60 * 30,
      staleWhileRevalidateSeconds: 60 * 60 * 12,
    },
    schema: supportedLocalesSchema,
  });

  supportedLocalesRequestCache.set(request, promise);

  return promise;
}

export async function purgeSupportedLocalesCache(
  context: AppLoadContext,
  request: Request,
) {
  await invalidateCachedData(context, buildSupportedLocalesCacheKey(request));
}

export async function purgeI18nLocaleCache(
  context: AppLoadContext,
  request: Request,
  locale: AppLocale,
) {
  await invalidateCachedData(context, buildI18nCacheKey(request, locale));
}

export async function purgeI18nDataCache(
  context: AppLoadContext,
  request: Request,
  localeCodes: readonly AppLocale[],
) {
  await Promise.all([
    purgeSupportedLocalesCache(context, request),
    ...localeCodes.map((localeCode) =>
      purgeI18nLocaleCache(context, request, localeCode),
    ),
  ]);
}

export async function loadI18nRuntimeState(
  context: AppLoadContext,
  request: Request,
): Promise<I18nRuntimeState> {
  const cachedPromise = localeRuntimeStateRequestCache.get(request);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = (async () => {
    const supportedLocales = await loadSupportedLocales(context, request);
    const defaultLocale = getDefaultLocale(supportedLocales);
    const supportedLocaleCodes = supportedLocales.map((item) => item.code);
    const locale = resolveRequestLocale(request, {
      fallbackLocale: defaultLocale,
      supportedLocales: supportedLocaleCodes,
    });

    return {
      defaultLocale,
      locale,
      supportedLocaleCodes,
      supportedLocales,
    };
  })();

  localeRuntimeStateRequestCache.set(request, promise);

  return promise;
}

export async function loadI18nPayload(context: AppLoadContext, request: Request) {
  const { defaultLocale, locale, supportedLocales } = await loadI18nRuntimeState(
    context,
    request,
  );
  const rows = await loadCachedData({
    context,
    key: buildI18nCacheKey(request, locale),
    load: () => listTranslationsByLocale(context, locale),
    options: {
      maxAgeSeconds: 60 * 30,
      staleWhileRevalidateSeconds: 60 * 60 * 12,
    },
    schema: translationsPayloadSchema,
  });

  const values = Object.fromEntries(
    rows.map((row) => [row.key as TranslationKey, row.value]),
  ) as Partial<Record<TranslationKey, string>>;

  return {
    locale,
    messages: mergeMessages(locale, values, defaultLocale),
    supportedLocales,
  } satisfies AppI18nPayload;
}

const localeFormSchema = z.object({
  locale: z.string().trim().min(2),
  redirectTo: z.string().trim().min(1).default("/"),
});

export function parseLocaleFormData(
  formData: FormData,
  supportedLocales: readonly SupportedLocaleOption[],
) {
  const parsed = localeFormSchema.safeParse({
    locale: formData.get("locale"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) {
    return null;
  }

  const supportedLocaleCodes = supportedLocales.map((locale) => locale.code);

  if (!supportedLocaleCodes.includes(parsed.data.locale.toLowerCase())) {
    return null;
  }

  return {
    locale: parsed.data.locale.toLowerCase(),
    redirectTo: sanitizeLocalizedRedirectTarget(
      parsed.data.redirectTo,
      parsed.data.locale.toLowerCase(),
      supportedLocaleCodes,
    ),
  };
}

export function buildLocaleHomePath(locale: AppLocale) {
  return buildLocalizedPath(locale, "/");
}

export function buildLocaleDashboardPath(locale: AppLocale) {
  return buildLocalizedPath(locale, "/dashboard");
}
