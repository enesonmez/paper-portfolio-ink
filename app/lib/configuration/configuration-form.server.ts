import { z } from "zod";

import {
  buildAccountConfigurationFormValues,
  type AccountConfigurationFormState,
} from "~/domain/configuration/form";
import {
  ACCOUNT_CONFIGURATION_FORM_FIELD,
  ACCOUNT_CONFIGURATION_KEYS,
  APPEARANCE_BODY_FONTS,
  APPEARANCE_HEADING_FONTS,
  APPEARANCE_PRIMARY_COLORS,
  getAccountConfigurationDefinition,
  isAccountConfigurationKey,
  isOptionalAccountConfigurationKey,
  type AccountConfigurationKey,
  type AppearanceBodyFont,
  type AppearanceHeadingFont,
  type AppearancePrimaryColor,
} from "~/domain/configuration/model";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { compactFieldErrors, readStringField } from "~/shared/forms/form-data.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

function isSecureConfigurationUrl(value: string) {
  const parsed = z.string().url().safeParse(value);

  if (!parsed.success) {
    return false;
  }

  return new URL(parsed.data).protocol === "https:";
}

function createAccountConfigurationSchema(t: I18nTranslator) {
  return z
    .object({
      key: z.enum(
        ACCOUNT_CONFIGURATION_KEYS as [
          AccountConfigurationKey,
          ...AccountConfigurationKey[],
        ],
        {
          error: () => t("validation.settings.key"),
        },
      ),
      value: z.string().trim(),
    })
    .superRefine((value, context) => {
      const definition = getAccountConfigurationDefinition(value.key);

      if (!definition) {
        return;
      }

      if (value.key === "site.name") {
        if (value.value.length < 2) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.settings.projectName.min"),
            path: ["value"],
          });
        }

        if (value.value.length > 80) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.settings.projectName.max"),
            path: ["value"],
          });
        }

        return;
      }

      if (value.key === "contact.email") {
        if (!z.string().email().safeParse(value.value).success) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.settings.contactEmail"),
            path: ["value"],
          });
        }

        return;
      }

      if (value.key === "appearance.primaryColor") {
        if (
          !Object.values(APPEARANCE_PRIMARY_COLORS).includes(
            value.value as AppearancePrimaryColor,
          )
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.settings.appearance.primaryColor"),
            path: ["value"],
          });
        }

        return;
      }

      if (value.key === "appearance.headingFont") {
        if (
          !Object.values(APPEARANCE_HEADING_FONTS).includes(
            value.value as AppearanceHeadingFont,
          )
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.settings.appearance.headingFont"),
            path: ["value"],
          });
        }

        return;
      }

      if (value.key === "appearance.bodyFont") {
        if (
          !Object.values(APPEARANCE_BODY_FONTS).includes(
            value.value as AppearanceBodyFont,
          )
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.settings.appearance.bodyFont"),
            path: ["value"],
          });
        }

        return;
      }

      if (isOptionalAccountConfigurationKey(value.key) && value.value.length === 0) {
        return;
      }

      if (!isSecureConfigurationUrl(value.value)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.settings.url"),
          path: ["value"],
        });
      }
    });
}

export type AccountConfigurationSubmission = z.infer<
  ReturnType<typeof createAccountConfigurationSchema>
>;

export function parseAccountConfigurationFormData(
  formData: FormData,
  t: I18nTranslator,
): AccountConfigurationSubmission {
  const rawValues = {
    key: readStringField(formData, ACCOUNT_CONFIGURATION_FORM_FIELD.key),
    value: readStringField(formData, ACCOUNT_CONFIGURATION_FORM_FIELD.value),
  };

  const parsed = createAccountConfigurationSchema(t).safeParse(rawValues);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errors = compactFieldErrors({
      key: fieldErrors.key?.[0],
      value: fieldErrors.value?.[0],
    });

    throw buildValidationError<AccountConfigurationFormState>({
      action: APP_ERROR_ACTION.validate,
      code: APP_ERROR_CODE.settings.validation,
      details: {
        invalidFields: Object.keys(errors),
      },
      message: "Account configuration validation failed",
      resource: APP_ERROR_RESOURCE.settings,
      responseData: {
        errors,
        values: buildAccountConfigurationFormValues({
          key: isAccountConfigurationKey(rawValues.key)
            ? rawValues.key
            : ACCOUNT_CONFIGURATION_KEYS[0],
          value: rawValues.value,
        }),
      },
    });
  }

  return parsed.data;
}
