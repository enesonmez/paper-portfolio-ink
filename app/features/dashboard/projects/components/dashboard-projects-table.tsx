import { Pencil, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardStatusBadge } from "~/components/dashboard/status-badge";
import {
  PROJECT_FORM_FIELD,
  PROJECT_MUTATION_INTENT,
} from "~/features/projects/project.shared";
import type { ProjectOverview } from "~/lib/projects/projects.server";

import { DASHBOARD_PROJECTS_COPY } from "../dashboard-projects.constants";
import {
  buildDashboardProjectsHref,
  formatDashboardProjectTitle,
  getProjectStatusTone,
} from "../dashboard-projects.shared";

interface DashboardProjectsTableProps {
  projects: ProjectOverview[];
}

export function DashboardProjectsTable({
  projects,
}: DashboardProjectsTableProps) {
  return (
    <DashboardPanel className="overflow-x-auto p-0">
      <table className="min-w-full border-collapse text-left">
        <thead className="bg-muted border-b-2 border-black">
          <tr>
            <th className="p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase">
              {DASHBOARD_PROJECTS_COPY.tableNameLabel}
            </th>
            <th className="p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase">
              {DASHBOARD_PROJECTS_COPY.tableSummaryLabel}
            </th>
            <th className="p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase">
              {DASHBOARD_PROJECTS_COPY.tableStatusLabel}
            </th>
            <th className="p-4 text-right font-sans text-xs font-bold tracking-[0.18em] uppercase">
              {DASHBOARD_PROJECTS_COPY.tableActionsLabel}
            </th>
          </tr>
        </thead>
        <tbody className="font-sans">
          {projects.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-6 text-center text-sm font-bold uppercase">
                {DASHBOARD_PROJECTS_COPY.emptyState}
              </td>
            </tr>
          ) : null}

          {projects.map((project) => (
            <tr key={project.id} className="border-b border-black/10 last:border-b-0">
              <td className="p-4 align-top">
                <div className="space-y-2">
                  <p className="font-display text-3xl leading-none uppercase">
                    {formatDashboardProjectTitle(project.title)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.isFeatured ? (
                      <DashboardStatusBadge
                        label={DASHBOARD_PROJECTS_COPY.featuredLabel}
                        tone="warning"
                      />
                    ) : null}
                    <DashboardStatusBadge
                      label={`Sort ${project.sortOrder}`}
                      tone="neutral"
                    />
                  </div>
                </div>
              </td>
              <td className="p-4 align-top">
                <p className="text-foreground text-sm font-bold">{project.summary}</p>
                <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-[11px] font-bold tracking-[0.12em] uppercase">
                  <span>{project.createdAtLabel}</span>
                  {project.repositoryUrl ? <span>Repo</span> : null}
                  {project.liveUrl ? <span>Live</span> : null}
                </div>
              </td>
              <td className="p-4 align-top">
                <DashboardStatusBadge
                  label={project.status}
                  tone={getProjectStatusTone(project.status)}
                />
              </td>
              <td className="p-4 align-top">
                <div className="flex justify-end gap-2">
                  <Link
                    to={buildDashboardProjectsHref({ editId: project.id })}
                    className="bg-primary border-2 border-black p-2 text-black transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
                    aria-label={`Edit ${formatDashboardProjectTitle(project.title)}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
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
                    <button
                      type="submit"
                      className="bg-destructive text-destructive-foreground border-2 border-black p-2 transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
                      aria-label={`Delete ${formatDashboardProjectTitle(project.title)}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </Form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardPanel>
  );
}
