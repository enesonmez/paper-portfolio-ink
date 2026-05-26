import { Pencil, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardPaginationControls } from "~/components/dashboard/pagination-controls";
import { Button } from "~/components/ui/button";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import { getSkillIcon, useSkillIconOptions } from "~/domain/skills/icons";
import { SKILL_FORM_FIELD, SKILL_MUTATION_INTENT } from "~/domain/skills/model";
import type { SkillOverview } from "~/lib/skills/skills.server";

import { useDashboardSkillsCopy } from "../copy";
import {
  buildDashboardSkillsHref,
  formatDashboardSkillName,
  type DashboardSkillsFilters,
  type DashboardSkillsPermissions,
} from "../state";
import type { DashboardPaginationState } from "../../shared/pagination";

interface DashboardSkillsTableProps {
  filters: DashboardSkillsFilters;
  pagination: DashboardPaginationState;
  permissions: DashboardSkillsPermissions;
  skills: SkillOverview[];
}

export function DashboardSkillsTable({
  filters,
  pagination,
  permissions,
  skills,
}: DashboardSkillsTableProps) {
  const to = useLocalizedPath();
  const t = useT();
  const { copy } = useDashboardSkillsCopy();
  const iconOptions = useSkillIconOptions();
  const listHrefState = {
    cursor: pagination.currentCursor,
    direction: pagination.direction,
    search: filters.searchQuery,
  } as const;
  const columns: DataTableColumn<SkillOverview>[] = [
    {
      cellClassName: "align-top",
      header: copy.tableIconLabel,
      id: "iconKey",
      render: (skill) => {
        const Icon = getSkillIcon(skill.iconKey);
        const iconOption =
          iconOptions.find((option) => option.value === skill.iconKey) ??
          iconOptions[0];

        return (
          <div className="space-y-2">
            <div className="bg-primary flex size-12 items-center justify-center border-2 border-black text-black">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <p className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
              {iconOption.label}
            </p>
          </div>
        );
      },
    },
    {
      cellClassName: "align-top",
      header: copy.tableNameLabel,
      id: "name",
      render: (skill) => (
        <div className="space-y-2">
          <p className="font-display text-3xl leading-none uppercase">
            {formatDashboardSkillName(skill.name)}
          </p>
          <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.16em] uppercase">
            {skill.slug}
          </p>
        </div>
      ),
    },
    {
      cellClassName: "align-top",
      header: copy.tableSummaryLabel,
      id: "summary",
      render: (skill) => <p className="font-sans text-sm font-bold">{skill.summary}</p>,
    },
    {
      cellClassName: "align-top",
      header: copy.tableSortLabel,
      id: "sortOrder",
      render: (skill) => (
        <p className="font-sans text-sm font-bold">{skill.sortOrder}</p>
      ),
    },
    {
      cellClassName: "align-top",
      header: copy.tableCreatedLabel,
      id: "createdAtLabel",
      render: (skill) => (
        <p className="font-sans text-sm font-bold">{skill.createdAtLabel}</p>
      ),
    },
  ];

  if (permissions.canUpdate || permissions.canDelete) {
    columns.push({
      cellClassName: "align-top",
      header: copy.tableActionsLabel,
      headerClassName: "text-right",
      id: "actions",
      render: (skill) => (
        <div className="flex justify-end gap-2">
          {permissions.canUpdate ? (
            <Button
              asChild
              size="iconSm"
              className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              aria-label={`${t("common.edit")} ${formatDashboardSkillName(skill.name)}`}
            >
              <Link
                to={to(
                  buildDashboardSkillsHref({
                    ...listHrefState,
                    editId: skill.id,
                  }),
                )}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          {permissions.canDelete ? (
            <Form method="post">
              <input
                type="hidden"
                name={SKILL_FORM_FIELD.intent}
                value={SKILL_MUTATION_INTENT.delete}
              />
              <input type="hidden" name={SKILL_FORM_FIELD.skillId} value={skill.id} />
              <Button
                type="submit"
                variant="destructive"
                size="iconSm"
                className="cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                aria-label={`${t("common.delete")} ${formatDashboardSkillName(skill.name)}`}
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
        getRowKey={(skill) => skill.id}
        rows={skills}
        bodyClassName="font-sans"
      />

      <DashboardPaginationControls
        nextHref={
          pagination.hasNextPage && pagination.nextCursor
            ? buildDashboardSkillsHref({
                search: filters.searchQuery,
                cursor: pagination.nextCursor,
                direction: "next",
              })
            : null
        }
        nextLabel={copy.paginationNextLabel}
        previousHref={
          pagination.hasPreviousPage && pagination.previousCursor
            ? buildDashboardSkillsHref({
                search: filters.searchQuery,
                cursor: pagination.previousCursor,
                direction: "previous",
              })
            : null
        }
        previousLabel={copy.paginationPreviousLabel}
      />
    </DashboardPanel>
  );
}
