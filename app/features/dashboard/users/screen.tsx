import { Link } from "react-router";
import { ShieldPlus } from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import type { UserOverview } from "~/lib/users/users.server";

import { useDashboardUsersCopy } from "./copy";
import {
  buildDashboardUsersHref,
  type DashboardUsersFormState,
  type DashboardUsersMetrics,
  type DashboardUsersPermissions,
} from "./state";
import { DashboardUsersModalView } from "./components/dashboard-users-modal";
import { DashboardUsersTable } from "./components/dashboard-users-table";

export interface DashboardUsersScreenProps {
  actionError?: string;
  form: DashboardUsersFormState;
  metrics: DashboardUsersMetrics;
  permissions: DashboardUsersPermissions;
  users: UserOverview[];
}

export function DashboardUsersScreen({
  actionError,
  form,
  metrics,
  permissions,
  users,
}: DashboardUsersScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardUsersCopy();

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
                <Link to={to(buildDashboardUsersHref({ modal: "create" }))}>
                  <ShieldPlus className="size-4" aria-hidden="true" />
                  {copy.createActionLabel}
                </Link>
              </Button>
            ) : null
          }
          eyebrow={copy.inventoryEyebrow}
          title={copy.registryTitle}
        />

        <DashboardUsersTable permissions={permissions} users={users} />
      </section>

      <DashboardUsersModalView form={form} />
      {!form.isOpen && actionError ? (
        <DashboardModal
          title={copy.actionBlockedTitle}
          description={actionError}
          to={to(buildDashboardUsersHref())}
        >
          <div className="space-y-4">
            <DashboardPanel className="bg-destructive text-destructive-foreground">
              <p className="font-sans text-sm font-bold" role="alert">
                {actionError}
              </p>
            </DashboardPanel>
            <div className="flex justify-end">
              <Button asChild className="tracking-[0.14em]">
                <Link to={to(buildDashboardUsersHref())}>{t("common.dismiss")}</Link>
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
