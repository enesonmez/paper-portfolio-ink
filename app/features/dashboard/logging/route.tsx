import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import {
  mergeDashboardLoggingRangeFormState,
  type DashboardLoggingActionData,
  type DashboardLoggingLoaderData,
} from "./state";
import { DashboardLoggingAccessDeniedScreen, DashboardLoggingScreen } from "./screen";

export { DashboardLoggingAccessDeniedScreen, DashboardLoggingScreen };

export default function DashboardLoggingRoute() {
  const loaderData = useLoaderData<DashboardLoggingLoaderData>();
  const actionData = useActionData<DashboardLoggingActionData>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardLoggingAccessDeniedScreen viewerRole={user.role} />;
  }

  return (
    <DashboardLoggingScreen
      loaderData={loaderData}
      notice={actionData?.notice}
      rangeForm={mergeDashboardLoggingRangeFormState(loaderData.rangeForm, actionData)}
    />
  );
}
