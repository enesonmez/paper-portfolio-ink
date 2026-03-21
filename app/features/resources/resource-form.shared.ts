export type ResourceBooleanValue = "false" | "true";

export interface LocaleFormValues {
  code: string;
  isActive: ResourceBooleanValue;
  isDefault: ResourceBooleanValue;
  label: string;
  sortOrder: string;
}

export interface LocaleFormState {
  errors?: Partial<Record<keyof LocaleFormValues, string>> & {
    form?: string;
  };
  values: LocaleFormValues;
}

export interface TranslationFormValues {
  key: string;
  locale: string;
  value: string;
}

export interface TranslationFormState {
  errors?: Partial<Record<keyof TranslationFormValues, string>> & {
    form?: string;
  };
  values: TranslationFormValues;
}

export function toResourceBooleanValue(value: boolean): ResourceBooleanValue {
  return value ? "true" : "false";
}

export function buildLocaleFormValues(
  values: Partial<LocaleFormValues> = {},
): LocaleFormValues {
  return {
    code: "",
    isActive: "true",
    isDefault: "false",
    label: "",
    sortOrder: "0",
    ...values,
  };
}

export function buildTranslationFormValues(
  values: Partial<TranslationFormValues> = {},
): TranslationFormValues {
  return {
    key: "",
    locale: "",
    value: "",
    ...values,
  };
}
