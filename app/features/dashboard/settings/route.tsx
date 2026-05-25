import { useLoaderData, useOutletContext } from "react-router";

import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import { DashboardSettingsAccessDeniedScreen, DashboardSettingsScreen } from "./screen";
import type { DashboardSettingsLoaderData } from "./state";

export { DashboardSettingsAccessDeniedScreen, DashboardSettingsScreen };

export default function DashboardSettingsRoute() {
  const loaderData = useLoaderData<DashboardSettingsLoaderData>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardSettingsAccessDeniedScreen viewerRole={user.role} />;
  }

  return <DashboardSettingsScreen loaderData={loaderData} />;
}
