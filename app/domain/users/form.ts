import { USER_ROLE, type UserRole } from "./model";

export type UserFormValues = {
  avatarUrl: string;
  bio: string;
  displayName: string;
  email: string;
  isActive: boolean;
  password: string;
  role: UserRole;
};

export interface UserFormState {
  errors?: Partial<Record<keyof UserFormValues, string>> & {
    form?: string;
  };
  values: UserFormValues;
}

export function getDefaultUserFormValues(): UserFormValues {
  return {
    avatarUrl: "",
    bio: "",
    displayName: "",
    email: "",
    isActive: true,
    password: "",
    role: USER_ROLE.author,
  };
}

export function buildUserFormValues(
  values: Partial<UserFormValues> = {},
): UserFormValues {
  return {
    ...getDefaultUserFormValues(),
    ...values,
  };
}
