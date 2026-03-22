import { Link } from "react-router";
import { Plus } from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import type { ProjectOverview } from "~/lib/projects/projects.server";

import { useDashboardProjectsCopy } from "./copy";
import {
  buildDashboardProjectsHref,
  type DashboardProjectsFormState,
  type DashboardProjectsMetrics,
  type DashboardProjectsPermissions,
} from "./state";
import { DashboardProjectsModalView } from "./components/dashboard-projects-modal";
import { DashboardProjectsTable } from "./components/dashboard-projects-table";

export interface DashboardProjectsScreenProps {
  form: DashboardProjectsFormState;
  metrics: DashboardProjectsMetrics;
  permissions: DashboardProjectsPermissions;
  projects: ProjectOverview[];
}

export function DashboardProjectsScreen({
  form,
  metrics,
  permissions,
  projects,
}: DashboardProjectsScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardProjectsCopy();

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label={t("dashboard.projects.metricTotal")}
          value={String(metrics.totalCount)}
        />
        <DashboardMetricCard
          accent="primary"
          label={t("dashboard.projects.metricFeatured")}
          value={String(metrics.featuredCount)}
        />
        <DashboardMetricCard
          label={t("dashboard.projects.metricLive")}
          value={String(metrics.liveCount)}
        />
      </section>

      <section className="space-y-4">
        <DashboardSectionHeading
          eyebrow={copy.inventoryEyebrow}
          title={copy.registryTitle}
          action={
            permissions.canCreate ? (
              <Button
                asChild
                className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Link to={to(buildDashboardProjectsHref({ modal: "create" }))}>
                  <Plus className="size-4" aria-hidden="true" />
                  {copy.createActionLabel}
                </Link>
              </Button>
            ) : null
          }
        />

        <DashboardProjectsTable permissions={permissions} projects={projects} />
      </section>

      <DashboardProjectsModalView form={form} />
    </div>
  );
}

export function DashboardProjectsAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  const { copy } = useDashboardProjectsCopy();

  return (
    <DashboardAuthorizationAccessDeniedScreen
      currentRoleLabel={copy.currentRoleLabel}
      description={copy.restrictedDescription}
      title={copy.restrictedTitle}
      viewerRole={viewerRole}
    />
  );
}
