import { z } from "zod";

import {
  normalizePublicTheme,
  PUBLIC_THEME,
  PUBLIC_THEME_FORM_FIELD,
  PUBLIC_THEME_INTENT,
  type PublicTheme,
} from "./public-layout.shared";

const THEME_COOKIE_NAME = "paper-theme";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

const themeFormSchema = z.object({
  intent: z.literal(PUBLIC_THEME_INTENT.setTheme),
  redirectTo: z.string().trim().min(1).default("/"),
  theme: z.enum([PUBLIC_THEME.light, PUBLIC_THEME.dark]),
});

function sanitizeRedirectTo(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
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

export function getThemeFromRequest(request: Request): PublicTheme {
  const cookies = parseCookieHeader(request.headers.get("Cookie"));
  const themeValue = cookies[THEME_COOKIE_NAME];

  return normalizePublicTheme(themeValue);
}

export function buildThemeCookie(theme: PublicTheme) {
  return [
    `${THEME_COOKIE_NAME}=${theme}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${ONE_YEAR_IN_SECONDS}`,
    "SameSite=Lax",
  ].join("; ");
}

export function parseThemeFormData(formData: FormData) {
  const parsed = themeFormSchema.safeParse({
    intent: formData.get(PUBLIC_THEME_FORM_FIELD.intent),
    redirectTo: formData.get(PUBLIC_THEME_FORM_FIELD.redirectTo),
    theme: formData.get(PUBLIC_THEME_FORM_FIELD.theme),
  });

  if (!parsed.success) {
    return null;
  }

  return {
    ...parsed.data,
    redirectTo: sanitizeRedirectTo(parsed.data.redirectTo),
  };
}
