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
