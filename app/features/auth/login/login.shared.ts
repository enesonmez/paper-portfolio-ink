export interface LoginFormValues {
  email: string;
  redirectTo: string;
}

export interface LoginFormState {
  errors?: {
    email?: string;
    form?: string;
    password?: string;
  };
  values: LoginFormValues;
}

export interface LoginLoaderData {
  redirectTo: string;
}

export function buildLoginFormValues(
  values: Partial<LoginFormValues> = {},
): LoginFormValues {
  return {
    email: "",
    redirectTo: "/dashboard",
    ...values,
  };
}

export function mergeLoginFormState(
  redirectTo: string,
  actionData?: LoginFormState,
): LoginFormState {
  return {
    errors: actionData?.errors,
    values: buildLoginFormValues({
      email: actionData?.values.email,
      redirectTo: actionData?.values.redirectTo ?? redirectTo,
    }),
  };
}
