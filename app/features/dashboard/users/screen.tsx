import { Form, Link } from "react-router";
import { Search, ShieldPlus } from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { SelectField, TextField } from "~/components/ui/form-field";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import type { UserOverview } from "~/lib/users/users.server";

import { useDashboardUsersCopy } from "./copy";
import {
  DASHBOARD_USERS_QUERY_PARAM,
  buildDashboardUsersHref,
  useDashboardUserActiveFilterOptions,
  useDashboardUserRoleFilterOptions,
  type DashboardUsersFilters,
  type DashboardUsersFormState,
  type DashboardUsersMetrics,
  type DashboardUsersPermissions,
} from "./state";
import { DashboardUsersModalView } from "./components/dashboard-users-modal";
import { DashboardUsersTable } from "./components/dashboard-users-table";
import type { DashboardPaginationState } from "../shared/pagination";

export interface DashboardUsersScreenProps {
  actionError?: string;
  filters: DashboardUsersFilters;
  form: DashboardUsersFormState;
  metrics: DashboardUsersMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardUsersPermissions;
  users: UserOverview[];
}

export function DashboardUsersScreen({
  actionError,
  filters,
  form,
  metrics,
  pagination,
  permissions,
  users,
}: DashboardUsersScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardUsersCopy();
  const roleOptions = useDashboardUserRoleFilterOptions();
  const activeOptions = useDashboardUserActiveFilterOptions();
  const listHrefState = {
    active: filters.active,
    cursor: pagination.currentCursor,
    direction: pagination.direction,
    role: filters.role,
    search: filters.searchQuery,
  } as const;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label={t("dashboard.users.metricTotal")}
          value={String(metrics.totalCount)}
        />
        <DashboardMetricCard
          accent="primary"
          label={t("dashboard.users.metricAdmin")}
          value={String(metrics.adminCount)}
        />
        <DashboardMetricCard
          label={t("dashboard.users.metricAuthor")}
          value={String(metrics.authorCount)}
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
                    buildDashboardUsersHref({
                      ...listHrefState,
                      modal: "create",
                    }),
                  )}
                >
                  <ShieldPlus className="size-4" aria-hidden="true" />
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
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto_auto]"
          >
            <TextField
              defaultValue={filters.searchQuery}
              label={copy.searchLabel}
              name={DASHBOARD_USERS_QUERY_PARAM.search}
              placeholder={copy.searchPlaceholder}
            />
            <SelectField
              defaultValue={filters.role}
              label={copy.roleFilterLabel}
              name={DASHBOARD_USERS_QUERY_PARAM.role}
              options={roleOptions}
            />
            <SelectField
              defaultValue={filters.active}
              label={copy.activeFilterLabel}
              name={DASHBOARD_USERS_QUERY_PARAM.active}
              options={activeOptions}
            />
            <Button type="submit" className="self-end">
              <Search className="size-4" aria-hidden="true" />
              {copy.searchActionLabel}
            </Button>
            <Button asChild className="self-end" variant="secondary">
              <Link to={to(buildDashboardUsersHref())}>{copy.clearFiltersLabel}</Link>
            </Button>
          </Form>
        </DashboardPanel>

        <DashboardUsersTable
          filters={filters}
          pagination={pagination}
          permissions={permissions}
          users={users}
        />
      </section>

      <DashboardUsersModalView form={form} listHrefState={listHrefState} />
      {!form.isOpen && actionError ? (
        <DashboardModal
          title={copy.actionBlockedTitle}
          description={actionError}
          to={to(buildDashboardUsersHref(listHrefState))}
        >
          <div className="space-y-4">
            <DashboardPanel className="bg-destructive text-destructive-foreground">
              <p className="font-sans text-sm font-bold" role="alert">
                {actionError}
              </p>
            </DashboardPanel>
            <div className="flex justify-end">
              <Button asChild className="tracking-[0.14em]">
                <Link to={to(buildDashboardUsersHref(listHrefState))}>
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

export function DashboardUsersAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  const { copy } = useDashboardUsersCopy();

  return (
    <DashboardAuthorizationAccessDeniedScreen
      currentRoleLabel={copy.currentRoleLabel}
      description={copy.restrictedDescription}
      title={copy.restrictedTitle}
      viewerRole={viewerRole}
    />
  );
}
