import { Form, Link } from "react-router";
import { Plus, Search } from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { SelectField, TextField } from "~/components/ui/form-field";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import type { ProjectOverview } from "~/lib/projects/projects.server";

import { useDashboardProjectsCopy } from "./copy";
import {
  DASHBOARD_PROJECTS_QUERY_PARAM,
  buildDashboardProjectsHref,
  useDashboardProjectStatusFilterOptions,
  type DashboardProjectsFilters,
  type DashboardProjectsFormState,
  type DashboardProjectsMetrics,
  type DashboardProjectsPermissions,
} from "./state";
import { DashboardProjectsModalView } from "./components/dashboard-projects-modal";
import { DashboardProjectsTable } from "./components/dashboard-projects-table";
import type { DashboardPaginationState } from "../shared/pagination";

export interface DashboardProjectsScreenProps {
  actionError?: string;
  filters: DashboardProjectsFilters;
  form: DashboardProjectsFormState;
  metrics: DashboardProjectsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardProjectsPermissions;
  projects: ProjectOverview[];
}

export function DashboardProjectsScreen({
  actionError,
  filters,
  form,
  metrics,
  pagination,
  permissions,
  projects,
}: DashboardProjectsScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardProjectsCopy();
  const statusOptions = useDashboardProjectStatusFilterOptions();
  const listHrefState = {
    cursor: pagination.currentCursor,
    direction: pagination.direction,
    search: filters.searchQuery,
    status: filters.status,
  } as const;

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
                <Link
                  to={to(
                    buildDashboardProjectsHref({
                      ...listHrefState,
                      modal: "create",
                    }),
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {copy.createActionLabel}
                </Link>
              </Button>
            ) : null
          }
        />

        <DashboardPanel className="space-y-4">
          <Form
            method="get"
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem_auto_auto]"
          >
            <TextField
              defaultValue={filters.searchQuery}
              label={copy.searchLabel}
              name={DASHBOARD_PROJECTS_QUERY_PARAM.search}
              placeholder={copy.searchPlaceholder}
            />
            <SelectField
              defaultValue={filters.status}
              label={copy.statusFilterLabel}
              name={DASHBOARD_PROJECTS_QUERY_PARAM.status}
              options={statusOptions}
            />
            <Button type="submit" className="self-end">
              <Search className="size-4" aria-hidden="true" />
              {copy.searchActionLabel}
            </Button>
            <Button asChild className="self-end" variant="secondary">
              <Link to={to(buildDashboardProjectsHref())}>
                {copy.clearFiltersLabel}
              </Link>
            </Button>
          </Form>
        </DashboardPanel>

        <DashboardProjectsTable
          filters={filters}
          pagination={pagination}
          permissions={permissions}
          projects={projects}
        />
      </section>

      <DashboardProjectsModalView form={form} listHrefState={listHrefState} />
      {!form.isOpen && actionError ? (
        <DashboardModal
          title={copy.actionBlockedTitle}
          description={actionError}
          to={to(buildDashboardProjectsHref(listHrefState))}
        >
          <div className="space-y-4">
            <DashboardPanel className="bg-destructive text-destructive-foreground">
              <p className="font-sans text-sm font-bold" role="alert">
                {actionError}
              </p>
            </DashboardPanel>
            <div className="flex justify-end">
              <Button asChild className="tracking-[0.14em]">
                <Link to={to(buildDashboardProjectsHref(listHrefState))}>
                  {t("common.dismiss")}
                </Link>
              </Button>
            </div>
          </div>
        </DashboardModal>
      ) : null}
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
