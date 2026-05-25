import { z } from "zod";

import {
  buildAccountConfigurationFormValues,
  type AccountConfigurationFormState,
} from "~/domain/configuration/form";
import {
  ACCOUNT_CONFIGURATION_FORM_FIELD,
  ACCOUNT_CONFIGURATION_KEY,
  ACCOUNT_CONFIGURATION_KEYS,
  isAccountConfigurationKey,
  type AccountConfigurationKey,
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
            : ACCOUNT_CONFIGURATION_KEY.projectName,
          value: rawValues.value,
        }),
      },
    });
  }

  return parsed.data;
}
