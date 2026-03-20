import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { UserFormState } from "~/features/users/user-form.shared";
import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/dashboard-layout.shared";

import {
  DashboardUsersAccessDeniedScreen,
  DashboardUsersScreen,
} from "./dashboard-users-screen";
import {
  mergeDashboardUsersFormState,
  type DashboardUsersLoaderData,
} from "./dashboard-users.shared";

export { DashboardUsersAccessDeniedScreen, DashboardUsersScreen };

export default function DashboardUsersRoute() {
  const loaderData = useLoaderData<DashboardUsersLoaderData>();
  const actionData = useActionData<UserFormState>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardUsersAccessDeniedScreen viewerRole={user.role} />;
  }

  return (
    <DashboardUsersScreen
      actionError={!loaderData.form.isOpen ? actionData?.errors?.form : undefined}
      form={mergeDashboardUsersFormState(loaderData.form, actionData)}
      metrics={loaderData.metrics}
      users={loaderData.users}
    />
  );
}
