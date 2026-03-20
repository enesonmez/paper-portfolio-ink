import { Pencil, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardStatusBadge } from "~/components/dashboard/status-badge";
import { Button } from "~/components/ui/button";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import {
  USER_FORM_FIELD,
  USER_MUTATION_INTENT,
} from "~/features/users/user.shared";
import type { UserOverview } from "~/lib/users/users.server";

import { DASHBOARD_USERS_COPY } from "../dashboard-users.constants";
import {
  buildDashboardUsersHref,
  formatDashboardUserRole,
} from "../dashboard-users.shared";

interface DashboardUsersTableProps {
  users: UserOverview[];
}

export function DashboardUsersTable({ users }: DashboardUsersTableProps) {
  const columns: DataTableColumn<UserOverview>[] = [
    {
      cellClassName: "align-top",
      header: DASHBOARD_USERS_COPY.tableIdentityLabel,
      id: "identity",
      render: (user) => (
        <div className="space-y-2">
          <p className="font-display text-3xl leading-none uppercase">
            {user.displayName}
          </p>
          <p className="text-foreground font-sans text-sm font-bold">{user.email}</p>
          {user.bio ? (
            <p className="text-muted-foreground text-xs font-bold">{user.bio}</p>
          ) : null}
        </div>
      ),
    },
    {
      cellClassName: "align-top",
      header: DASHBOARD_USERS_COPY.tableRoleLabel,
      id: "role",
      render: (user) => (
        <DashboardStatusBadge
          label={`${formatDashboardUserRole(user.role)} / ${user.isActive ? "ACTIVE" : "INACTIVE"}`}
          tone={
            !user.isActive
              ? "danger"
              : user.role === "admin"
                ? "warning"
                : "neutral"
          }
        />
      ),
    },
    {
      cellClassName: "align-top",
      header: DASHBOARD_USERS_COPY.tableMetaLabel,
      id: "meta",
      render: (user) => (
        <div className="text-muted-foreground space-y-2 font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
          <p>Created {user.createdAtLabel}</p>
          <p>Updated {user.updatedAtLabel}</p>
          {user.avatarUrl ? <p>Avatar Bound</p> : <p>No Avatar</p>}
          <p>{user.isActive ? "Session Enabled" : "Session Disabled"}</p>
        </div>
      ),
    },
    {
      cellClassName: "align-top",
      header: DASHBOARD_USERS_COPY.tableActionsLabel,
      headerClassName: "text-right",
      id: "actions",
      render: (user) => (
        <div className="flex justify-end gap-2">
          <Button
            asChild
            size="iconSm"
            className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            aria-label={`Edit ${user.email}`}
          >
            <Link to={buildDashboardUsersHref({ editId: user.id })}>
              <Pencil className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Form method="post">
            <input
              type="hidden"
              name={USER_FORM_FIELD.intent}
              value={USER_MUTATION_INTENT.delete}
            />
            <input
              type="hidden"
              name={USER_FORM_FIELD.userId}
              value={user.id}
            />
            <Button
              type="submit"
              variant="destructive"
              size="iconSm"
              className="cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              aria-label={`Deactivate ${user.email}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <DashboardPanel className="overflow-x-auto p-0">
      <DataTable
        bodyClassName="font-sans"
        columns={columns}
        emptyState={DASHBOARD_USERS_COPY.emptyState}
        getRowKey={(user) => user.id}
        rows={users}
      />
    </DashboardPanel>
  );
}
