import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { AccountConfigurationFormState } from "~/domain/configuration/form";
import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import { DashboardSettingsAccessDeniedScreen, DashboardSettingsScreen } from "./screen";
import {
  mergeDashboardSettingsAccountFormState,
  type DashboardSettingsLoaderData,
} from "./state";

export { DashboardSettingsAccessDeniedScreen, DashboardSettingsScreen };

export default function DashboardSettingsRoute() {
  const loaderData = useLoaderData<DashboardSettingsLoaderData>();
  const actionData = useActionData<AccountConfigurationFormState>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardSettingsAccessDeniedScreen viewerRole={user.role} />;
  }

  return (
    <DashboardSettingsScreen
      loaderData={{
        ...loaderData,
        accountForm: mergeDashboardSettingsAccountFormState(
          loaderData.accountForm,
          actionData,
        ),
      }}
    />
  );
}
