import { z } from "zod";

import { buildUserFormValues, type UserFormState } from "~/domain/users/form";
import {
  USER_FORM_FIELD,
  USER_MUTATION_INTENT,
  USER_ROLE,
  USER_ROLE_VALUES,
  type UserMutationIntent,
  type UserRole,
} from "~/domain/users/model";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { compactFieldErrors, readStringField } from "~/shared/forms/form-data.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

function createUserFormSchema(t: I18nTranslator) {
  return z.object({
    avatarUrl: z.string().trim().url(t("validation.user.avatarUrl")).or(z.literal("")),
    bio: z.string().trim().max(500, t("validation.user.bio.max")),
    displayName: z
      .string()
      .trim()
      .min(2, t("validation.user.displayName.min"))
      .max(80, t("validation.user.displayName.max")),
    email: z
      .email(t("validation.user.email"))
      .transform((value) => value.trim().toLowerCase()),
    isActive: z.boolean(),
    password: z.string().trim().max(128, t("validation.user.password.max")),
    role: z.enum(USER_ROLE_VALUES, {
      error: () => t("validation.user.role"),
    }),
  });
}

export type UserSubmission = z.infer<ReturnType<typeof createUserFormSchema>>;

function buildPasswordError(
  intent: UserMutationIntent,
  password: string,
  t: I18nTranslator,
) {
  if (intent === USER_MUTATION_INTENT.create && password.length < 8) {
    return t("validation.user.password.createMin");
  }

  if (
    intent === USER_MUTATION_INTENT.update &&
    password.length > 0 &&
    password.length < 8
  ) {
    return t("validation.user.password.updateMin");
  }

  return undefined;
}

export function parseUserFormData(
  formData: FormData,
  intent: UserMutationIntent,
  t: I18nTranslator,
): UserSubmission {
  const rawValues = {
    avatarUrl: readStringField(formData, USER_FORM_FIELD.avatarUrl),
    bio: readStringField(formData, USER_FORM_FIELD.bio),
    displayName: readStringField(formData, USER_FORM_FIELD.displayName),
    email: readStringField(formData, USER_FORM_FIELD.email),
    isActive: formData.get(USER_FORM_FIELD.isActive) === "on",
    password: readStringField(formData, USER_FORM_FIELD.password),
    role: readStringField(formData, USER_FORM_FIELD.role) || USER_ROLE.author,
  };

  const parsed = createUserFormSchema(t).safeParse(rawValues);
  const passwordError = buildPasswordError(intent, rawValues.password.trim(), t);

  if (!parsed.success || passwordError) {
    const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors;
    const errors = compactFieldErrors({
      avatarUrl: fieldErrors.avatarUrl?.[0],
      bio: fieldErrors.bio?.[0],
      displayName: fieldErrors.displayName?.[0],
      email: fieldErrors.email?.[0],
      isActive: fieldErrors.isActive?.[0],
      password: passwordError,
      role: fieldErrors.role?.[0],
    });

    throw buildValidationError<UserFormState>({
      action: APP_ERROR_ACTION.validate,
      code: APP_ERROR_CODE.users.validation,
      details: {
        invalidFields: Object.keys(errors),
      },
      message: "User form validation failed",
      resource: APP_ERROR_RESOURCE.users,
      responseData: {
        errors,
        values: buildUserFormValues({
          ...rawValues,
          role: USER_ROLE_VALUES.includes(rawValues.role as UserRole)
            ? (rawValues.role as UserRole)
            : USER_ROLE.author,
        }),
      },
    });
  }

  return parsed.data;
}
