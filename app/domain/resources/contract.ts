type ValueOf<T> = T[keyof T];

export const RESOURCE_MUTATION_INTENT = {
  createLocale: "create-locale",
  createTranslation: "create-translation",
  deleteLocale: "delete-locale",
  deleteTranslation: "delete-translation",
  updateLocale: "update-locale",
  updateTranslation: "update-translation",
} as const;

export type ResourceMutationIntent = ValueOf<typeof RESOURCE_MUTATION_INTENT>;

export function isResourceMutationIntent(
  value: string,
): value is ResourceMutationIntent {
  return Object.values(RESOURCE_MUTATION_INTENT).includes(
    value as ResourceMutationIntent,
  );
}

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
