import { Pencil, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardStatusBadge } from "~/components/dashboard/status-badge";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { Button } from "~/components/ui/button";
import { useLocalizedPath, useT } from "~/features/i18n/i18n-react";
import {
  PROJECT_FORM_FIELD,
  PROJECT_MUTATION_INTENT,
} from "~/features/projects/project.shared";
import type { ProjectOverview } from "~/lib/projects/projects.server";

import { useDashboardProjectsCopy } from "../dashboard-projects.constants";
import {
  buildDashboardProjectsHref,
  formatDashboardProjectTitle,
  getProjectStatusTone,
} from "../dashboard-projects.shared";

interface DashboardProjectsTableProps {
  projects: ProjectOverview[];
}

export function DashboardProjectsTable({ projects }: DashboardProjectsTableProps) {
  const { copy } = useDashboardProjectsCopy();
  const to = useLocalizedPath();
  const t = useT();

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
    {
      cellClassName: "align-top",
      header: copy.tableActionsLabel,
      headerClassName: "text-right",
      id: "actions",
      render: (project) => (
        <div className="flex justify-end gap-2">
          <Button
            asChild
            size="iconSm"
            className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            aria-label={`${t("aria.projects.edit")} ${formatDashboardProjectTitle(project.title)}`}
          >
            <Link to={to(buildDashboardProjectsHref({ editId: project.id }))}>
              <Pencil className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Form method="post">
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
        </div>
      ),
    },
  ];

  return (
    <DashboardPanel className="overflow-x-auto p-0">
      <DataTable
        columns={columns}
        emptyState={copy.emptyState}
        getRowKey={(project) => project.id}
        rows={projects}
        bodyClassName="font-sans"
      />
    </DashboardPanel>
  );
}
