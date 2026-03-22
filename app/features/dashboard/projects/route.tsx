import { useActionData, useLoaderData } from "react-router";

import type { ProjectFormState } from "~/domain/projects/form";

import { DashboardProjectsScreen } from "./screen";
import {
  mergeDashboardProjectsFormState,
  type DashboardProjectsLoaderData,
} from "./state";

export { DashboardProjectsScreen } from "./screen";

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
