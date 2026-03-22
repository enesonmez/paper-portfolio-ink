type ValueOf<T> = T[keyof T];

export const PUBLIC_THEME = {
  dark: "dark",
  light: "light",
} as const;

export type PublicTheme = ValueOf<typeof PUBLIC_THEME>;

export const PUBLIC_THEME_FORM_FIELD = {
  intent: "intent",
  redirectTo: "redirectTo",
  theme: "theme",
} as const;

export const PUBLIC_THEME_INTENT = {
  setTheme: "set-theme",
} as const;

export type PublicThemeIntent = ValueOf<typeof PUBLIC_THEME_INTENT>;

export function normalizePublicTheme(value: string | null | undefined): PublicTheme {
  return value === PUBLIC_THEME.dark ? PUBLIC_THEME.dark : PUBLIC_THEME.light;
}
