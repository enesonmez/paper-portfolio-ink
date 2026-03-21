import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { SkillFormState } from "~/features/skills/skill-form.shared";
import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/dashboard-layout.shared";

import {
  DashboardSkillsAccessDeniedScreen,
  DashboardSkillsScreen,
} from "./dashboard-skills-screen";
import {
  mergeDashboardSkillsFormState,
  type DashboardSkillsLoaderData,
} from "./dashboard-skills.shared";

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
      form={mergeDashboardSkillsFormState(loaderData.form, actionData)}
      metrics={loaderData.metrics}
      skills={loaderData.skills}
    />
  );
}
