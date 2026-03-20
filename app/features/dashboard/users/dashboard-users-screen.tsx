import { Link } from "react-router";
import { ShieldPlus } from "lucide-react";

import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import type { UserOverview } from "~/lib/users/users.server";

import { DASHBOARD_USERS_COPY } from "./dashboard-users.constants";
import {
  buildDashboardUsersHref,
  type DashboardUsersFormState,
  type DashboardUsersMetrics,
} from "./dashboard-users.shared";
import { DashboardUsersModalView } from "./components/dashboard-users-modal";
import { DashboardUsersTable } from "./components/dashboard-users-table";

export interface DashboardUsersScreenProps {
  actionError?: string;
  form: DashboardUsersFormState;
  metrics: DashboardUsersMetrics;
  users: UserOverview[];
}

export function DashboardUsersScreen({
  actionError,
  form,
  metrics,
  users,
}: DashboardUsersScreenProps) {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Total Users" value={String(metrics.totalCount)} />
        <DashboardMetricCard
          accent="primary"
          label="Admin Seats"
          value={String(metrics.adminCount)}
        />
        <DashboardMetricCard
          label="Author Seats"
          value={String(metrics.authorCount)}
        />
      </section>

      <section className="space-y-4">
        <DashboardSectionHeading
          action={
            <Button
              asChild
              className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              <Link to={buildDashboardUsersHref({ modal: "create" })}>
                <ShieldPlus className="size-4" aria-hidden="true" />
                {DASHBOARD_USERS_COPY.createActionLabel}
              </Link>
            </Button>
          }
          eyebrow={DASHBOARD_USERS_COPY.inventoryEyebrow}
          title={DASHBOARD_USERS_COPY.registryTitle}
        />

        <DashboardUsersTable users={users} />
      </section>

      <DashboardUsersModalView form={form} />
      {!form.isOpen && actionError ? (
        <DashboardModal
          title={DASHBOARD_USERS_COPY.actionBlockedTitle}
          description={actionError}
          to="/dashboard/users"
        >
          <div className="space-y-4">
            <DashboardPanel className="bg-destructive text-destructive-foreground">
              <p className="font-sans text-sm font-bold" role="alert">
                {actionError}
              </p>
            </DashboardPanel>
            <div className="flex justify-end">
              <Button asChild className="tracking-[0.14em]">
                <Link to="/dashboard/users">Dismiss</Link>
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
  return (
    <div className="space-y-4">
      <DashboardSectionHeading
        eyebrow="Role Guard"
        title={DASHBOARD_USERS_COPY.restrictedTitle}
      />
      <DashboardPanel className="space-y-3">
        <p className="font-sans text-sm font-bold">
          {DASHBOARD_USERS_COPY.restrictedDescription}
        </p>
        <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.14em] uppercase">
          {DASHBOARD_USERS_COPY.currentRoleLabel}: {viewerRole}
        </p>
      </DashboardPanel>
    </div>
  );
}
