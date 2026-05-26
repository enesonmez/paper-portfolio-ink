import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { SkillFormState } from "~/domain/skills/form";
import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import { DashboardSkillsAccessDeniedScreen, DashboardSkillsScreen } from "./screen";
import { mergeDashboardSkillsFormState, type DashboardSkillsLoaderData } from "./state";

export { DashboardSkillsAccessDeniedScreen, DashboardSkillsScreen };

export default function DashboardSkillsRoute() {
  const loaderData = useLoaderData<DashboardSkillsLoaderData>();
  const actionData = useActionData<SkillFormState>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardSkillsAccessDeniedScreen viewerRole={user.role} />;
  }

  return (
    <DashboardSkillsScreen
      actionError={!loaderData.form.isOpen ? actionData?.errors?.form : undefined}
      filters={loaderData.filters}
      form={mergeDashboardSkillsFormState(loaderData.form, actionData)}
      metrics={loaderData.metrics}
      pagination={loaderData.pagination}
      permissions={loaderData.permissions}
      skills={loaderData.skills}
    />
  );
}
