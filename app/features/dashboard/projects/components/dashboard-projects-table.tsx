import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Form, Link, useSubmit } from "react-router";

import { ConfirmModal } from "~/components/dashboard/confirm-modal";

import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardPaginationControls } from "~/components/dashboard/pagination-controls";
import { DashboardStatusBadge } from "~/components/dashboard/status-badge";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { Button } from "~/components/ui/button";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import { PROJECT_FORM_FIELD, PROJECT_MUTATION_INTENT } from "~/domain/projects/model";
import type { ProjectOverview } from "~/lib/projects/projects.server";

import { useDashboardProjectsCopy } from "../copy";
import {
  buildDashboardProjectsHref,
  formatDashboardProjectTitle,
  getProjectStatusTone,
  type DashboardProjectsFilters,
  type DashboardProjectsPermissions,
} from "../state";
import {
  DASHBOARD_PAGINATION_DIRECTION,
  type DashboardPaginationState,
} from "../../shared/pagination";

interface DashboardProjectsTableProps {
  filters: DashboardProjectsFilters;
  pagination: DashboardPaginationState;
  permissions: DashboardProjectsPermissions;
  projects: ProjectOverview[];
}

export function DashboardProjectsTable({
  filters,
  pagination,
  permissions,
  projects,
}: DashboardProjectsTableProps) {
  const [confirmingProjectId, setConfirmingProjectId] = useState<string | null>(null);
  const submit = useSubmit();
  const { copy } = useDashboardProjectsCopy();
  const to = useLocalizedPath();
  const t = useT();
  const listHrefState = {
    cursor: pagination.currentCursor,
    direction: pagination.direction,
    search: filters.searchQuery,
    status: filters.status,
  } as const;

  const columns: DataTableColumn<ProjectOverview>[] = [
    {
      cellClassName: "align-top",
      header: copy.tableNameLabel,
      id: "title",
      render: (project) => (
        <div className="space-y-2">
          <p className="font-display text-3xl leading-none uppercase">
            {formatDashboardProjectTitle(project.title)}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.isFeatured ? (
              <DashboardStatusBadge label={copy.featuredLabel} tone="warning" />
            ) : null}
            <DashboardStatusBadge
              label={`${copy.tableSortPrefix} ${project.sortOrder}`}
              tone="neutral"
            />
          </div>
        </div>
      ),
    },
    {
      cellClassName: "align-top",
      header: copy.tableSummaryLabel,
      id: "summary",
      render: (project) => (
        <>
          <p className="text-foreground text-sm font-bold">{project.summary}</p>
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-[11px] font-bold tracking-[0.12em] uppercase">
            <span>{project.createdAtLabel}</span>
            {project.repositoryUrl ? <span>{copy.tableRepositoryFlag}</span> : null}
            {project.liveUrl ? <span>{copy.tableLiveFlag}</span> : null}
          </div>
        </>
      ),
    },
    {
      cellClassName: "align-top",
      header: copy.tableStatusLabel,
      id: "status",
      render: (project) => (
        <DashboardStatusBadge
          label={project.status}
          tone={getProjectStatusTone(project.status)}
        />
      ),
    },
  ];

  if (permissions.canUpdate || permissions.canDelete) {
    columns.push({
      cellClassName: "align-top",
      header: copy.tableActionsLabel,
      headerClassName: "text-right",
      id: "actions",
      render: (project) => (
        <div className="flex justify-end gap-2">
          {permissions.canUpdate ? (
            <Button
              asChild
              size="iconSm"
              className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              aria-label={`${t("aria.projects.edit")} ${formatDashboardProjectTitle(project.title)}`}
            >
              <Link
                to={to(
                  buildDashboardProjectsHref({
                    ...listHrefState,
                    editId: project.id,
                  }),
                )}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          {permissions.canDelete ? (
            <Form
              id={`delete-project-form-${project.id}`}
              method="post"
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmingProjectId(project.id);
              }}
            >
              <input
                type="hidden"
                name={PROJECT_FORM_FIELD.intent}
                value={PROJECT_MUTATION_INTENT.delete}
              />
              <input
                type="hidden"
                name={PROJECT_FORM_FIELD.projectId}
                value={project.id}
              />
              <Button
                type="submit"
                variant="destructive"
                size="iconSm"
                className="cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                aria-label={`${t("aria.projects.delete")} ${formatDashboardProjectTitle(project.title)}`}
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
        columns={columns}
        emptyState={copy.emptyState}
        getRowKey={(project) => project.id}
        rows={projects}
        bodyClassName="font-sans"
      />

      <DashboardPaginationControls
        nextHref={
          pagination.hasNextPage && pagination.nextCursor
            ? buildDashboardProjectsHref({
                search: filters.searchQuery,
                status: filters.status,
                cursor: pagination.nextCursor,
                direction: DASHBOARD_PAGINATION_DIRECTION.next,
              })
            : null
        }
        nextLabel={copy.paginationNextLabel}
        previousHref={
          pagination.hasPreviousPage && pagination.previousCursor
            ? buildDashboardProjectsHref({
                search: filters.searchQuery,
                status: filters.status,
                cursor: pagination.previousCursor,
                direction: DASHBOARD_PAGINATION_DIRECTION.previous,
              })
            : null
        }
        previousLabel={copy.paginationPreviousLabel}
      />

      <ConfirmModal
        isOpen={confirmingProjectId !== null}
        title={t("common.confirmDeleteTitle")}
        description={t("common.confirmDeleteDescription")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => {
          if (confirmingProjectId) {
            const form = document.getElementById(
              `delete-project-form-${confirmingProjectId}`,
            ) as HTMLFormElement | null;
            if (form) {
              void submit(new FormData(form), { method: "post" });
            }
          }
          setConfirmingProjectId(null);
        }}
        onCancel={() => setConfirmingProjectId(null)}
        variant="destructive"
      />
    </DashboardPanel>
  );
}
