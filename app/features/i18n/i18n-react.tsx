import { createContext, useContext, type ReactNode } from "react";

import {
  buildLocalizedPath,
  createTranslator,
  getSeedMessages,
  getSeedLocaleOptions,
  type AppLocale,
  type I18nTranslator,
} from "./i18n.shared";
import type { AppI18nPayload } from "./i18n.server";

interface AppI18nContextValue extends AppI18nPayload {
  t: I18nTranslator;
}

const AppI18nContext = createContext<AppI18nContextValue | null>(null);
const FALLBACK_LOCALE: AppLocale = "en";
const FALLBACK_MESSAGES = getSeedMessages(FALLBACK_LOCALE);
const FALLBACK_I18N_CONTEXT: AppI18nContextValue = {
  locale: FALLBACK_LOCALE,
  messages: FALLBACK_MESSAGES,
  supportedLocales: getSeedLocaleOptions(),
  t: createTranslator(FALLBACK_MESSAGES),
};

interface AppI18nProviderProps {
  children: ReactNode;
  value: AppI18nPayload;
}

export function AppI18nProvider({ children, value }: AppI18nProviderProps) {
  return (
    <AppI18nContext.Provider
      value={{
        ...value,
        t: createTranslator(value.messages),
      }}
    >
      {children}
    </AppI18nContext.Provider>
  );
}

export function useAppI18n() {
  const context = useContext(AppI18nContext);

  return context ?? FALLBACK_I18N_CONTEXT;
}

export function useLocale() {
  return useAppI18n().locale;
}

export function useT() {
  return useAppI18n().t;
}

export function useLocalizedPath() {
  const context = useContext(AppI18nContext);

  return (value: string) => {
    if (!context) {
      const url = new URL(
        value.startsWith("/") ? value : `/${value}`,
        "https://app.local",
      );

      return `${url.pathname}${url.search}${url.hash}`;
    }

    return buildLocalizedPath(
      context.locale,
      value,
      context.supportedLocales.map((locale) => locale.code),
    );
  };
}

export function buildLocalizedPathForLocale(locale: AppLocale, value: string) {
  return buildLocalizedPath(locale, value);
}
