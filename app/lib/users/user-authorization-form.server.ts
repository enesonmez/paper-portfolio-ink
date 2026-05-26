import { z } from "zod";

import {
  buildUserAuthorizationFormValues,
  type UserAuthorizationFormState,
} from "~/domain/users/form";
import { USER_FORM_FIELD, USER_ROLE_VALUES, type UserRole } from "~/domain/users/model";
import { isAuthorizationClaim, type AuthorizationClaim } from "~/shared/authz/model";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { compactFieldErrors, readStringField } from "~/shared/forms/form-data.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

const authzVersionSchema = z.string().trim().regex(/^\d+$/);

function buildAuthorizationFormErrorState(args: {
  authzVersion: string;
  claimKey?: string;
  role: string;
  t: I18nTranslator;
  errors?: UserAuthorizationFormState["errors"];
}) {
  return {
    errors: args.errors,
    values: buildUserAuthorizationFormValues({
      authzVersion: args.authzVersion,
      claimKey: args.claimKey ?? "",
      role: USER_ROLE_VALUES.includes(args.role as UserRole)
        ? (args.role as UserRole)
        : USER_ROLE_VALUES[1],
    }),
  } satisfies UserAuthorizationFormState;
}

export interface UserAuthorizationRoleSubmission {
  authzVersion: number;
  role: UserRole;
}

export interface UserClaimOverrideSubmission {
  authzVersion: number;
  claimKey: AuthorizationClaim;
}

export function parseUserAuthorizationRoleFormData(
  formData: FormData,
  t: I18nTranslator,
): UserAuthorizationRoleSubmission {
  const rawValues = {
    authzVersion: readStringField(formData, USER_FORM_FIELD.authzVersion),
    role: readStringField(formData, USER_FORM_FIELD.role),
  };

  const parsedAuthzVersion = authzVersionSchema.safeParse(rawValues.authzVersion);
  const parsedRole = z.enum(USER_ROLE_VALUES).safeParse(rawValues.role);
  const errors = compactFieldErrors({
    authzVersion: parsedAuthzVersion.success
      ? undefined
      : t("validation.user.authzVersion"),
    role: parsedRole.success ? undefined : t("validation.user.role"),
  });

  if (Object.keys(errors).length > 0) {
    throw buildValidationError<UserAuthorizationFormState>({
      action: APP_ERROR_ACTION.validate,
      code: APP_ERROR_CODE.users.validation,
      details: {
        invalidFields: Object.keys(errors),
      },
      message: "User authorization role form validation failed",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildAuthorizationFormErrorState({
        authzVersion: rawValues.authzVersion,
        errors,
        role: rawValues.role,
        t,
      }),
    });
  }

  return {
    authzVersion: Number(parsedAuthzVersion.data),
    role: parsedRole.data as UserRole,
  };
}

export function parseUserClaimOverrideFormData(
  formData: FormData,
  t: I18nTranslator,
): UserClaimOverrideSubmission {
  const rawValues = {
    authzVersion: readStringField(formData, USER_FORM_FIELD.authzVersion),
    claimKey: readStringField(formData, USER_FORM_FIELD.claimKey),
    role: readStringField(formData, USER_FORM_FIELD.role),
  };
  const parsedVersion = authzVersionSchema.safeParse(rawValues.authzVersion);
  const claimKey = rawValues.claimKey.trim();
  const errors = compactFieldErrors({
    authzVersion: parsedVersion.success ? undefined : t("validation.user.authzVersion"),
    claimKey: isAuthorizationClaim(claimKey)
      ? undefined
      : t("validation.user.authorizationClaim"),
  });

  if (Object.keys(errors).length > 0) {
    throw buildValidationError<UserAuthorizationFormState>({
      action: APP_ERROR_ACTION.validate,
      code: APP_ERROR_CODE.users.validation,
      details: {
        invalidFields: Object.keys(errors),
      },
      message: "User claim override form validation failed",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildAuthorizationFormErrorState({
        authzVersion: rawValues.authzVersion,
        claimKey,
        errors,
        role: rawValues.role,
        t,
      }),
    });
  }

  return {
    authzVersion: Number(parsedVersion.data),
    claimKey: claimKey as AuthorizationClaim,
  } satisfies UserClaimOverrideSubmission;
}
