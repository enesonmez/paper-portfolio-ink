import { z } from "zod";

import {
  buildLocaleFormValues,
  buildTranslationFormValues,
  type LocaleFormState,
  type TranslationFormState,
} from "~/domain/resources/form";
import { RESOURCE_FORM_FIELD } from "~/domain/resources/contract";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { compactFieldErrors, readStringField } from "~/shared/forms/form-data.server";
import {
  NORMALIZED_LOCALE_CODE_PATTERN,
  type I18nTranslator,
} from "~/shared/i18n/i18n.shared";

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
): LocaleSubmission {
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
    const errors = compactFieldErrors({
      code: fieldErrors.code?.[0],
      isActive: fieldErrors.isActive?.[0],
      isDefault: fieldErrors.isDefault?.[0],
      label: fieldErrors.label?.[0],
      sortOrder: fieldErrors.sortOrder?.[0],
    });

    throw buildValidationError<LocaleFormState>({
      action: APP_ERROR_ACTION.validate,
      code: APP_ERROR_CODE.resources.locales.validation,
      details: {
        invalidFields: Object.keys(errors),
      },
      message: "Locale form validation failed",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: {
        errors,
        values: buildLocaleFormValues(rawValues),
      },
    });
  }

  return parsed.data;
}

export function parseTranslationFormData(
  formData: FormData,
  availableLocaleCodes: readonly string[],
  t: I18nTranslator,
): TranslationSubmission {
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
    const errors = compactFieldErrors({
      key: fieldErrors.key?.[0],
      locale: fieldErrors.locale?.[0],
      value: fieldErrors.value?.[0],
    });

    throw buildValidationError<TranslationFormState>({
      action: APP_ERROR_ACTION.validate,
      code: APP_ERROR_CODE.resources.translations.validation,
      details: {
        invalidFields: Object.keys(errors),
      },
      message: "Translation form validation failed",
      resource: APP_ERROR_RESOURCE.resourcesTranslations,
      responseData: {
        errors,
        values: buildTranslationFormValues(rawValues),
      },
    });
  }

  return parsed.data;
}
