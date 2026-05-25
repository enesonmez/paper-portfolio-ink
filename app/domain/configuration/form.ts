import { ACCOUNT_CONFIGURATION_KEY, type AccountConfigurationKey } from "./model";

export interface AccountConfigurationFormValues {
  key: AccountConfigurationKey;
  value: string;
}

export interface AccountConfigurationFormState {
  errors?: Partial<Record<keyof AccountConfigurationFormValues, string>> & {
    form?: string;
  };
  values: AccountConfigurationFormValues;
}

export function getDefaultAccountConfigurationFormValues(): AccountConfigurationFormValues {
  return {
    key: ACCOUNT_CONFIGURATION_KEY.projectName,
    value: "",
  };
}

export function buildAccountConfigurationFormValues(
  values: Partial<AccountConfigurationFormValues> = {},
): AccountConfigurationFormValues {
  return {
    ...getDefaultAccountConfigurationFormValues(),
    ...values,
  };
}
