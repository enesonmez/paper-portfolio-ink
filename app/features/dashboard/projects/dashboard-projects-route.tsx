import { useActionData, useLoaderData } from "react-router";

import type { ProjectFormState } from "~/features/projects/project-form.shared";

import { DashboardProjectsScreen } from "./dashboard-projects-screen";
import {
  mergeDashboardProjectsFormState,
  type DashboardProjectsLoaderData,
} from "./dashboard-projects.shared";

export { DashboardProjectsScreen } from "./dashboard-projects-screen";

export default function DashboardProjectsRoute() {
  const loaderData = useLoaderData<DashboardProjectsLoaderData>();
  const actionData = useActionData<ProjectFormState>();

  return (
    <DashboardProjectsScreen
      form={mergeDashboardProjectsFormState(loaderData.form, actionData)}
      metrics={loaderData.metrics}
      projects={loaderData.projects}
    />
  );
}
