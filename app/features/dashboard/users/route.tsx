import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { UserFormState } from "~/domain/users/form";
import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import { DashboardUsersAccessDeniedScreen, DashboardUsersScreen } from "./screen";
import { mergeDashboardUsersFormState, type DashboardUsersLoaderData } from "./state";

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
      filters={loaderData.filters}
      form={mergeDashboardUsersFormState(loaderData.form, actionData)}
      metrics={loaderData.metrics}
      pagination={loaderData.pagination}
      permissions={loaderData.permissions}
      users={loaderData.users}
    />
  );
}
