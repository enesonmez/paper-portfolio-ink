type ValueOf<T> = T[keyof T];

export const DASHBOARD_RESOURCES_TAB = {
  locales: "locales",
  translations: "translations",
} as const;

export type DashboardResourcesTab = ValueOf<typeof DASHBOARD_RESOURCES_TAB>;

export const DASHBOARD_RESOURCES_QUERY_PARAM = {
  editLocaleCode: "editLocaleCode",
  editTranslationKey: "editTranslationKey",
  editTranslationLocale: "editTranslationLocale",
  modal: "modal",
  tab: "tab",
  translationLocale: "translationLocale",
  translationPage: "translationPage",
  translationSearch: "translationSearch",
} as const;

export const DASHBOARD_RESOURCES_MODAL = {
  createLocale: "create-locale",
  createTranslation: "create-translation",
  editLocale: "edit-locale",
  editTranslation: "edit-translation",
} as const;

export type DashboardResourcesModal = ValueOf<typeof DASHBOARD_RESOURCES_MODAL>;

export const RESOURCE_MUTATION_INTENT = {
  createLocale: "create-locale",
  createTranslation: "create-translation",
  deleteLocale: "delete-locale",
  deleteTranslation: "delete-translation",
  updateLocale: "update-locale",
  updateTranslation: "update-translation",
} as const;

export type ResourceMutationIntent = ValueOf<typeof RESOURCE_MUTATION_INTENT>;

export const RESOURCE_FORM_FIELD = {
  code: "code",
  intent: "intent",
  isActive: "isActive",
  isDefault: "isDefault",
  key: "key",
  label: "label",
  locale: "locale",
  originalCode: "originalCode",
  originalKey: "originalKey",
  originalLocale: "originalLocale",
  sortOrder: "sortOrder",
  value: "value",
} as const;
