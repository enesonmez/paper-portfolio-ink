import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { ProjectFormState } from "~/domain/projects/form";
import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import { DashboardProjectsAccessDeniedScreen, DashboardProjectsScreen } from "./screen";
import {
  mergeDashboardProjectsFormState,
  type DashboardProjectsLoaderData,
} from "./state";

export { DashboardProjectsAccessDeniedScreen, DashboardProjectsScreen } from "./screen";

export default function DashboardProjectsRoute() {
  const loaderData = useLoaderData<DashboardProjectsLoaderData>();
  const actionData = useActionData<ProjectFormState>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardProjectsAccessDeniedScreen viewerRole={user.role} />;
  }

  return (
    <DashboardProjectsScreen
      actionError={!loaderData.form.isOpen ? actionData?.errors?.form : undefined}
      filters={loaderData.filters}
      form={mergeDashboardProjectsFormState(loaderData.form, actionData)}
      metrics={loaderData.metrics}
      pagination={loaderData.pagination}
      permissions={loaderData.permissions}
      projects={loaderData.projects}
    />
  );
}
