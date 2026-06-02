import {
  buildAccountConfigurationFormValues,
  type AccountConfigurationFormState,
} from "~/domain/configuration/form";

import type { DashboardSettingsActionData } from "../../state";

export function buildSettingsAccountActionData(
  message: string,
  values: AccountConfigurationFormState["values"] = buildAccountConfigurationFormValues(),
): DashboardSettingsActionData {
  return {
    accountForm: {
      errors: {
        form: message,
      },
      values,
    },
  };
}
