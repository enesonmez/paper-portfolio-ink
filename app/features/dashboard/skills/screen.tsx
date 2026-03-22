import { Link } from "react-router";
import { Plus } from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import type { SkillOverview } from "~/lib/skills/skills.server";

import { useDashboardSkillsCopy } from "./copy";
import {
  buildDashboardSkillsHref,
  type DashboardSkillsFormState,
  type DashboardSkillsMetrics,
  type DashboardSkillsPermissions,
} from "./state";
import { DashboardSkillsModalView } from "./components/dashboard-skills-modal";
import { DashboardSkillsTable } from "./components/dashboard-skills-table";

export interface DashboardSkillsScreenProps {
  actionError?: string;
  form: DashboardSkillsFormState;
  metrics: DashboardSkillsMetrics;
  permissions: DashboardSkillsPermissions;
  skills: SkillOverview[];
}

export function DashboardSkillsScreen({
  actionError,
  form,
  metrics,
  permissions,
  skills,
}: DashboardSkillsScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardSkillsCopy();

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label={t("dashboard.skills.metricTotal")}
          value={String(metrics.totalCount)}
        />
      </section>

      <section className="space-y-4">
        <DashboardSectionHeading
          action={
            permissions.canCreate ? (
              <Button
                asChild
                className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Link to={to(buildDashboardSkillsHref({ modal: "create" }))}>
                  <Plus className="size-4" aria-hidden="true" />
                  {copy.createActionLabel}
                </Link>
              </Button>
            ) : null
          }
          eyebrow={copy.inventoryEyebrow}
          title={copy.registryTitle}
        />

        <DashboardSkillsTable permissions={permissions} skills={skills} />
      </section>

      <DashboardSkillsModalView form={form} />
      {!form.isOpen && actionError ? (
        <DashboardModal
          title={copy.actionBlockedTitle}
          description={actionError}
          to={to(buildDashboardSkillsHref())}
        >
          <div className="space-y-4">
            <DashboardPanel className="bg-destructive text-destructive-foreground">
              <p className="font-sans text-sm font-bold" role="alert">
                {actionError}
              </p>
            </DashboardPanel>
            <div className="flex justify-end">
              <Button asChild className="tracking-[0.14em]">
                <Link to={to(buildDashboardSkillsHref())}>{t("common.dismiss")}</Link>
              </Button>
            </div>
          </div>
        </DashboardModal>
      ) : null}
    </div>
  );
}

export function DashboardSkillsAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  const { copy } = useDashboardSkillsCopy();

  return (
    <DashboardAuthorizationAccessDeniedScreen
      currentRoleLabel={copy.currentRoleLabel}
      description={copy.restrictedDescription}
      title={copy.restrictedTitle}
      viewerRole={viewerRole}
    />
  );
}
