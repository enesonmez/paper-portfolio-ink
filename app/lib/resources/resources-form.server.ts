import { z } from "zod";

import {
  buildLocaleFormValues,
  buildTranslationFormValues,
  type LocaleFormState,
  type TranslationFormState,
} from "~/domain/resources/form";
import { RESOURCE_FORM_FIELD } from "~/domain/resources/contract";
import {
  NORMALIZED_LOCALE_CODE_PATTERN,
  type I18nTranslator,
} from "~/shared/i18n/i18n.shared";

function compactFieldErrors<T extends Record<string, string | undefined>>(errors: T) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => typeof value === "string"),
  ) as Partial<T>;
}

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function createLocaleFormSchema(t: I18nTranslator) {
  return z
    .object({
      code: z
        .string()
        .trim()
        .toLowerCase()
        .regex(NORMALIZED_LOCALE_CODE_PATTERN, t("validation.resource.locale.code")),
      isActive: z.boolean(),
      isDefault: z.boolean(),
      label: z
        .string()
        .trim()
        .min(2, t("validation.resource.locale.label.min"))
        .max(48, t("validation.resource.locale.label.max")),
      sortOrder: z.coerce
        .number()
        .int(t("validation.resource.locale.sortOrder.int"))
        .min(0, t("validation.resource.locale.sortOrder.min")),
    })
    .superRefine((value, ctx) => {
      if (value.isDefault && !value.isActive) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.resource.locale.defaultActive"),
          path: ["isDefault"],
        });
      }
    });
}

function createTranslationFormSchema(
  t: I18nTranslator,
  availableLocaleCodes: readonly string[],
) {
  return z.object({
    key: z
      .string()
      .trim()
      .min(2, t("validation.resource.translation.key.min"))
      .max(140, t("validation.resource.translation.key.max"))
      .regex(/^[a-z0-9_.-]+$/i, t("validation.resource.translation.key.pattern")),
    locale: z
      .string()
      .trim()
      .toLowerCase()
      .refine(
        (value) => availableLocaleCodes.includes(value),
        t("validation.resource.translation.locale"),
      ),
    value: z
      .string()
      .trim()
      .min(1, t("validation.resource.translation.value.min"))
      .max(4000, t("validation.resource.translation.value.max")),
  });
}

export type LocaleSubmission = z.infer<ReturnType<typeof createLocaleFormSchema>>;
export type TranslationSubmission = z.infer<
  ReturnType<typeof createTranslationFormSchema>
>;

export function parseLocaleFormData(
  formData: FormData,
  t: I18nTranslator,
): { data: LocaleSubmission } | LocaleFormState {
  const rawValues = {
    code: readStringField(formData, RESOURCE_FORM_FIELD.code),
    isActive: (readStringField(formData, RESOURCE_FORM_FIELD.isActive) || "true") as
      | "false"
      | "true",
    isDefault: (readStringField(formData, RESOURCE_FORM_FIELD.isDefault) || "false") as
      | "false"
      | "true",
    label: readStringField(formData, RESOURCE_FORM_FIELD.label),
    sortOrder: readStringField(formData, RESOURCE_FORM_FIELD.sortOrder) || "0",
  };

  const parsed = createLocaleFormSchema(t).safeParse({
    code: rawValues.code,
    isActive: rawValues.isActive === "true",
    isDefault: rawValues.isDefault === "true",
    label: rawValues.label,
    sortOrder: rawValues.sortOrder,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: compactFieldErrors({
        code: fieldErrors.code?.[0],
        isActive: fieldErrors.isActive?.[0],
        isDefault: fieldErrors.isDefault?.[0],
        label: fieldErrors.label?.[0],
        sortOrder: fieldErrors.sortOrder?.[0],
      }),
      values: buildLocaleFormValues(rawValues),
    };
  }

  return {
    data: parsed.data,
  };
}

export function parseTranslationFormData(
  formData: FormData,
  availableLocaleCodes: readonly string[],
  t: I18nTranslator,
): { data: TranslationSubmission } | TranslationFormState {
  const fallbackLocale = availableLocaleCodes[0] ?? "";
  const rawValues = {
    key: readStringField(formData, RESOURCE_FORM_FIELD.key),
    locale: readStringField(formData, RESOURCE_FORM_FIELD.locale) || fallbackLocale,
    value: readStringField(formData, RESOURCE_FORM_FIELD.value),
  };

  const parsed = createTranslationFormSchema(t, availableLocaleCodes).safeParse(
    rawValues,
  );

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: compactFieldErrors({
        key: fieldErrors.key?.[0],
        locale: fieldErrors.locale?.[0],
        value: fieldErrors.value?.[0],
      }),
      values: buildTranslationFormValues(rawValues),
    };
  }

  return {
    data: parsed.data,
  };
}

export function hasParsedLocaleData(
  submission: LocaleFormState | { data: LocaleSubmission },
): submission is { data: LocaleSubmission } {
  return "data" in submission;
}

export function hasParsedTranslationData(
  submission: TranslationFormState | { data: TranslationSubmission },
): submission is { data: TranslationSubmission } {
  return "data" in submission;
}
