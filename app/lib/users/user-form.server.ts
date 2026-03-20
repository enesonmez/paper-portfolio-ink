import { z } from "zod";

import {
  buildUserFormValues,
  type UserFormState,
} from "~/features/users/user-form.shared";
import {
  USER_FORM_FIELD,
  USER_MUTATION_INTENT,
  USER_ROLE,
  USER_ROLE_VALUES,
  type UserMutationIntent,
  type UserRole,
} from "~/features/users/user.shared";

const userFormSchema = z.object({
  avatarUrl: z
    .string()
    .trim()
    .url("Gecerli bir avatar URL gir.")
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Biyografi en fazla 500 karakter olabilir."),
  displayName: z
    .string()
    .trim()
    .min(2, "Gorunen ad en az 2 karakter olmali.")
    .max(80, "Gorunen ad en fazla 80 karakter olabilir."),
  email: z
    .email("Gecerli bir e-posta adresi gir.")
    .transform((value) => value.trim().toLowerCase()),
  isActive: z.boolean(),
  password: z.string().trim().max(128, "Parola en fazla 128 karakter olabilir."),
  role: z.enum(USER_ROLE_VALUES, {
    error: () => "Gecerli bir kullanici rolu sec.",
  }),
});

export type UserSubmission = z.infer<typeof userFormSchema>;

function compactFieldErrors<T extends Record<string, string | undefined>>(errors: T) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => typeof value === "string"),
  ) as Partial<T>;
}

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function buildPasswordError(
  intent: UserMutationIntent,
  password: string,
) {
  if (intent === USER_MUTATION_INTENT.create && password.length < 8) {
    return "Parola en az 8 karakter olmali.";
  }

  if (
    intent === USER_MUTATION_INTENT.update &&
    password.length > 0 &&
    password.length < 8
  ) {
    return "Parola degistirilecekse en az 8 karakter olmali.";
  }

  return undefined;
}

export function parseUserFormData(
  formData: FormData,
  intent: UserMutationIntent,
): { data: UserSubmission } | UserFormState {
  const rawValues = {
    avatarUrl: readStringField(formData, USER_FORM_FIELD.avatarUrl),
    bio: readStringField(formData, USER_FORM_FIELD.bio),
    displayName: readStringField(formData, USER_FORM_FIELD.displayName),
    email: readStringField(formData, USER_FORM_FIELD.email),
    isActive: formData.get(USER_FORM_FIELD.isActive) === "on",
    password: readStringField(formData, USER_FORM_FIELD.password),
    role: readStringField(formData, USER_FORM_FIELD.role) || USER_ROLE.author,
  };

  const parsed = userFormSchema.safeParse(rawValues);
  const passwordError = buildPasswordError(intent, rawValues.password.trim());

  if (!parsed.success || passwordError) {
    const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors;

    return {
      errors: compactFieldErrors({
        avatarUrl: fieldErrors.avatarUrl?.[0],
        bio: fieldErrors.bio?.[0],
        displayName: fieldErrors.displayName?.[0],
        email: fieldErrors.email?.[0],
        isActive: fieldErrors.isActive?.[0],
        password: passwordError,
        role: fieldErrors.role?.[0],
      }),
      values: buildUserFormValues({
        ...rawValues,
        role: USER_ROLE_VALUES.includes(rawValues.role as UserRole)
          ? (rawValues.role as UserRole)
          : USER_ROLE.author,
      }),
    };
  }

  return {
    data: parsed.data,
  };
}

export function hasParsedUserData(
  submission: UserFormState | { data: UserSubmission },
): submission is { data: UserSubmission } {
  return "data" in submission;
}
