import {
  DEFAULT_LOCALE,
  I18N_SEED_MESSAGES,
  type AppLocale,
  type TranslationDictionary,
  type TranslationKey,
  I18N_SEED_LOCALES,
} from "./messages.shared";

export type { AppLocale, TranslationDictionary, TranslationKey };
export interface SupportedLocaleOption {
  code: AppLocale;
  label: string;
  isDefault: boolean;
}

export const LOCALE_COOKIE_NAME = "paper-locale";
export const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
export const NORMALIZED_LOCALE_CODE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/;
const LOCALE_CODE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;
const SEED_LOCALE_CODES = I18N_SEED_LOCALES.map((locale) => locale.code);

export type I18nTranslationValues = Record<string, string | number>;
export type I18nTranslator = (
  key: TranslationKey,
  values?: I18nTranslationValues,
) => string;

function interpolateMessage(template: string, values?: I18nTranslationValues) {
  if (!values) {
    return template;
  }

  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value));
  }, template);
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .map((segment) => {
        const [rawKey, ...rawValue] = segment.split("=");
        return [rawKey, rawValue.join("=")];
      }),
  );
}

export function isLocaleCode(value: string | null | undefined): value is AppLocale {
  return Boolean(value && LOCALE_CODE_PATTERN.test(value));
}

function normalizeLocaleCode(value: string) {
  return value.toLowerCase();
}

function normalizeSupportedLocaleCodes(supportedLocales?: readonly string[]) {
  return supportedLocales
    ?.map((locale) => normalizeLocaleCode(locale))
    .filter((locale, index, values) => values.indexOf(locale) === index);
}

export function isSupportedLocale(
  value: string | null | undefined,
  supportedLocales?: readonly string[],
): value is AppLocale {
  if (!isLocaleCode(value)) {
    return false;
  }

  const normalizedValue = normalizeLocaleCode(value);
  const normalizedSupportedLocales =
    normalizeSupportedLocaleCodes(supportedLocales) ?? SEED_LOCALE_CODES;

  return normalizedSupportedLocales.includes(normalizedValue);
}

export function normalizeLocale(
  value: string | null | undefined,
  supportedLocales?: readonly string[],
  fallbackLocale: AppLocale = DEFAULT_LOCALE,
) {
  if (isSupportedLocale(value, supportedLocales)) {
    return normalizeLocaleCode(value);
  }

  return fallbackLocale;
}

export function getLocaleFromPathname(
  pathname: string,
  supportedLocales?: readonly string[],
): AppLocale | null {
  const [firstSegment] = pathname.split("/").filter(Boolean);

  if (!firstSegment || !isLocaleCode(firstSegment)) {
    return null;
  }

  if (supportedLocales && !isSupportedLocale(firstSegment, supportedLocales)) {
    return null;
  }

  return normalizeLocaleCode(firstSegment);
}

export function detectLocaleFromAcceptLanguage(
  header: string | null,
  supportedLocales?: readonly string[],
  fallbackLocale: AppLocale = DEFAULT_LOCALE,
) {
  if (!header) {
    return fallbackLocale;
  }

  const candidates = header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter((part): part is string => Boolean(part));

  for (const candidate of candidates) {
    const base = candidate.split("-")[0];

    if (isSupportedLocale(base, supportedLocales)) {
      return normalizeLocaleCode(base);
    }
  }

  return fallbackLocale;
}

export function getLocaleCookie(
  request: Request,
  supportedLocales?: readonly string[],
  fallbackLocale: AppLocale = DEFAULT_LOCALE,
) {
  const cookies = parseCookieHeader(request.headers.get("Cookie"));

  return normalizeLocale(cookies[LOCALE_COOKIE_NAME], supportedLocales, fallbackLocale);
}

interface ResolveRequestLocaleOptions {
  fallbackLocale?: AppLocale;
  supportedLocales?: readonly string[];
}

export function resolveRequestLocale(
  request: Request,
  options?: ResolveRequestLocaleOptions,
) {
  const url = new URL(request.url);
  const fallbackLocale = options?.fallbackLocale ?? DEFAULT_LOCALE;
  const supportedLocales = options?.supportedLocales;
  const pathnameLocale = getLocaleFromPathname(url.pathname, supportedLocales);

  if (pathnameLocale) {
    return pathnameLocale;
  }

  return (
    getLocaleCookie(request, supportedLocales, fallbackLocale) ??
    detectLocaleFromAcceptLanguage(
      request.headers.get("Accept-Language"),
      supportedLocales,
      fallbackLocale,
    )
  );
}

export function buildLocaleCookie(locale: AppLocale) {
  return [
    `${LOCALE_COOKIE_NAME}=${locale}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${ONE_YEAR_IN_SECONDS}`,
    "SameSite=Lax",
  ].join("; ");
}

export function buildLocalizedPath(
  locale: AppLocale,
  value: string,
  supportedLocales?: readonly string[],
) {
  const url = new URL(value.startsWith("/") ? value : `/${value}`, "https://app.local");
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments[0] && getLocaleFromPathname(`/${segments[0]}`, supportedLocales)) {
    segments.shift();
  }

  const localizedPathname =
    segments.length === 0 ? `/${locale}` : `/${locale}/${segments.join("/")}`;

  return `${localizedPathname}${url.search}${url.hash}`;
}

export function stripLocalePrefix(
  pathname: string,
  supportedLocales?: readonly string[],
) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] && getLocaleFromPathname(`/${segments[0]}`, supportedLocales)) {
    segments.shift();
  }

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

export function createTranslator(messages: TranslationDictionary): I18nTranslator {
  return (key, values) => interpolateMessage(messages[key], values);
}

export function mergeMessages(
  locale: AppLocale,
  values: Partial<Record<TranslationKey, string>>,
  fallbackLocale: AppLocale = DEFAULT_LOCALE,
): TranslationDictionary {
  const defaults = getSeedMessages(locale, fallbackLocale);

  return Object.fromEntries(
    (Object.keys(defaults) as TranslationKey[]).map((key) => [
      key,
      values[key] ?? defaults[key],
    ]),
  ) as TranslationDictionary;
}

export function getSeedMessages(
  locale: AppLocale,
  fallbackLocale: AppLocale = DEFAULT_LOCALE,
) {
  const normalizedLocale = normalizeLocaleCode(locale);
  const normalizedFallbackLocale = normalizeLocaleCode(fallbackLocale);

  return (
    I18N_SEED_MESSAGES[normalizedLocale as keyof typeof I18N_SEED_MESSAGES] ??
    I18N_SEED_MESSAGES[normalizedFallbackLocale as keyof typeof I18N_SEED_MESSAGES] ??
    I18N_SEED_MESSAGES[DEFAULT_LOCALE]
  );
}

export function getSeedLocaleOptions(): SupportedLocaleOption[] {
  return I18N_SEED_LOCALES.map((locale) => ({
    code: locale.code,
    label: locale.label,
    isDefault: locale.isDefault,
  }));
}

export function getDefaultLocale(supportedLocales: readonly SupportedLocaleOption[]) {
  return (
    supportedLocales.find((locale) => locale.isDefault)?.code ??
    supportedLocales[0]?.code ??
    DEFAULT_LOCALE
  );
}

export function sanitizeLocalizedRedirectTarget(
  value: string | null | undefined,
  locale: AppLocale,
  supportedLocales?: readonly string[],
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return buildLocalizedPath(locale, "/", supportedLocales);
  }

  return buildLocalizedPath(locale, value, supportedLocales);
}
