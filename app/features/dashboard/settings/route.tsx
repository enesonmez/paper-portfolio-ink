import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import { DashboardSettingsAccessDeniedScreen, DashboardSettingsScreen } from "./screen";
import {
  mergeDashboardSettingsAccountFormState,
  type DashboardSettingsActionData,
  type DashboardSettingsLoaderData,
} from "./state";

export { DashboardSettingsAccessDeniedScreen, DashboardSettingsScreen };

export default function DashboardSettingsRoute() {
  const loaderData = useLoaderData<DashboardSettingsLoaderData>();
  const actionData = useActionData<DashboardSettingsActionData>();
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
      notice={actionData?.notice}
    />
  );
}
