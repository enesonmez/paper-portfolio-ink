import { Form, Link } from "react-router";
import { Plus, Search } from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/form-field";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import type { SkillOverview } from "~/lib/skills/skills.server";

import { useDashboardSkillsCopy } from "./copy";
import {
  DASHBOARD_SKILLS_MODAL,
  DASHBOARD_SKILLS_QUERY_PARAM,
  buildDashboardSkillsHref,
  type DashboardSkillsFilters,
  type DashboardSkillsFormState,
  type DashboardSkillsMetrics,
  type DashboardSkillsPermissions,
} from "./state";
import { DashboardSkillsModalView } from "./components/dashboard-skills-modal";
import { DashboardSkillsTable } from "./components/dashboard-skills-table";
import type { DashboardPaginationState } from "../shared/pagination";

export interface DashboardSkillsScreenProps {
  actionError?: string;
  filters: DashboardSkillsFilters;
  form: DashboardSkillsFormState;
  metrics: DashboardSkillsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardSkillsPermissions;
  skills: SkillOverview[];
}

export function DashboardSkillsScreen({
  actionError,
  filters,
  form,
  metrics,
  pagination,
  permissions,
  skills,
}: DashboardSkillsScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardSkillsCopy();
  const listHrefState = {
    cursor: pagination.currentCursor,
    direction: pagination.direction,
    search: filters.searchQuery,
  } as const;

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
                <Link
                  to={to(
                    buildDashboardSkillsHref({
                      ...listHrefState,
                      modal: DASHBOARD_SKILLS_MODAL.create,
                    }),
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {copy.createActionLabel}
                </Link>
              </Button>
            ) : null
          }
          eyebrow={copy.inventoryEyebrow}
          title={copy.registryTitle}
        />

        <DashboardPanel className="space-y-4">
          <Form
            method="get"
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
          >
            <TextField
              defaultValue={filters.searchQuery}
              label={copy.searchLabel}
              name={DASHBOARD_SKILLS_QUERY_PARAM.search}
              placeholder={copy.searchPlaceholder}
            />
            <Button type="submit" className="self-end">
              <Search className="size-4" aria-hidden="true" />
              {copy.searchActionLabel}
            </Button>
            <Button asChild className="self-end" variant="secondary">
              <Link to={to(buildDashboardSkillsHref())}>{copy.clearFiltersLabel}</Link>
            </Button>
          </Form>
        </DashboardPanel>

        <DashboardSkillsTable
          filters={filters}
          pagination={pagination}
          permissions={permissions}
          skills={skills}
        />
      </section>

      <DashboardSkillsModalView form={form} listHrefState={listHrefState} />
      {!form.isOpen && actionError ? (
        <DashboardModal
          title={copy.actionBlockedTitle}
          description={actionError}
          to={to(buildDashboardSkillsHref(listHrefState))}
        >
          <div className="space-y-4">
            <DashboardPanel className="bg-destructive text-destructive-foreground">
              <p className="font-sans text-sm font-bold" role="alert">
                {actionError}
              </p>
            </DashboardPanel>
            <div className="flex justify-end">
              <Button asChild className="tracking-[0.14em]">
                <Link to={to(buildDashboardSkillsHref(listHrefState))}>
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
