import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardPaginationControls } from "~/components/dashboard/pagination-controls";
import { DashboardStatusBadge } from "~/components/dashboard/status-badge";
import { Button } from "~/components/ui/button";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import { USER_FORM_FIELD, USER_MUTATION_INTENT } from "~/domain/users/model";
import type { UserOverview } from "~/lib/users/users.server";

import { useDashboardUsersCopy } from "../copy";
import {
  buildDashboardUsersHref,
  formatDashboardUserRole,
  type DashboardUsersFilters,
  type DashboardUsersPermissions,
} from "../state";
import type { DashboardPaginationState } from "../../shared/pagination";

interface DashboardUsersTableProps {
  filters: DashboardUsersFilters;
  pagination: DashboardPaginationState;
  permissions: DashboardUsersPermissions;
  users: UserOverview[];
}

export function DashboardUsersTable({
  filters,
  pagination,
  permissions,
  users,
}: DashboardUsersTableProps) {
  const to = useLocalizedPath();
  const t = useT();
  const { copy } = useDashboardUsersCopy();
  const listHrefState = {
    active: filters.active,
    cursor: pagination.currentCursor,
    direction: pagination.direction,
    role: filters.role,
    search: filters.searchQuery,
  } as const;
  const columns: DataTableColumn<UserOverview>[] = [
    {
      cellClassName: "align-top",
      header: copy.tableIdentityLabel,
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
      header: copy.tableRoleLabel,
      id: "role",
      render: (user) => (
        <DashboardStatusBadge
          label={`${formatDashboardUserRole(user.role)} / ${user.isActive ? t("common.active") : t("common.inactive")}`}
          tone={
            !user.isActive ? "danger" : user.role === "admin" ? "warning" : "neutral"
          }
        />
      ),
    },
    {
      cellClassName: "align-top",
      header: copy.tableMetaLabel,
      id: "meta",
      render: (user) => (
        <div className="text-muted-foreground space-y-2 font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
          <p>{`${t("dashboard.users.metaCreatedPrefix")} ${user.createdAtLabel}`}</p>
          <p>{`${t("dashboard.users.metaUpdatedPrefix")} ${user.updatedAtLabel}`}</p>
          {user.avatarUrl ? (
            <p>{t("dashboard.users.metaAvatarBound")}</p>
          ) : (
            <p>{t("dashboard.users.metaNoAvatar")}</p>
          )}
          <p>
            {user.isActive
              ? t("dashboard.users.metaSessionEnabled")
              : t("dashboard.users.metaSessionDisabled")}
          </p>
        </div>
      ),
    },
  ];

  if (permissions.canUpdate || permissions.canDelete) {
    columns.push({
      cellClassName: "align-top",
      header: copy.tableActionsLabel,
      headerClassName: "text-right",
      id: "actions",
      render: (user) => (
        <div className="flex justify-end gap-2">
          {permissions.canUpdate ? (
            <Button
              asChild
              size="iconSm"
              className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              aria-label={`${t("common.edit")} ${user.email}`}
            >
              <Link
                to={to(
                  buildDashboardUsersHref({
                    ...listHrefState,
                    modal: "edit",
                    editId: user.id,
                  }),
                )}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          {permissions.canUpdate ? (
            <Button
              asChild
              size="iconSm"
              variant="secondary"
              className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              aria-label={`${copy.accessActionLabel} ${user.email}`}
            >
              <Link
                to={to(
                  buildDashboardUsersHref({
                    ...listHrefState,
                    editId: user.id,
                    modal: "access",
                  }),
                )}
              >
                <KeyRound className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          {permissions.canDelete ? (
            <Form method="post">
              <input
                type="hidden"
                name={USER_FORM_FIELD.intent}
                value={USER_MUTATION_INTENT.delete}
              />
              <input type="hidden" name={USER_FORM_FIELD.userId} value={user.id} />
              <Button
                type="submit"
                variant="destructive"
                size="iconSm"
                className="cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                aria-label={`${t("common.deactivate")} ${user.email}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </Form>
          ) : null}
        </div>
      ),
    });
  }

  return (
    <DashboardPanel className="space-y-4 overflow-x-auto p-4">
      <DataTable
        bodyClassName="font-sans"
        columns={columns}
        emptyState={copy.emptyState}
        getRowKey={(user) => user.id}
        rows={users}
      />

      <DashboardPaginationControls
        nextHref={
          pagination.hasNextPage && pagination.nextCursor
            ? buildDashboardUsersHref({
                active: filters.active,
                cursor: pagination.nextCursor,
                direction: "next",
                role: filters.role,
                search: filters.searchQuery,
              })
            : null
        }
        nextLabel={copy.paginationNextLabel}
        previousHref={
          pagination.hasPreviousPage && pagination.previousCursor
            ? buildDashboardUsersHref({
                active: filters.active,
                cursor: pagination.previousCursor,
                direction: "previous",
                role: filters.role,
                search: filters.searchQuery,
              })
            : null
        }
        previousLabel={copy.paginationPreviousLabel}
      />
    </DashboardPanel>
  );
}
