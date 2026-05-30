import { Link } from "react-router";
import { BarChart3 } from "lucide-react";

import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { Button } from "~/components/ui/button";
import { DashboardPaginationControls } from "~/components/dashboard/pagination-controls";
import {
  DASHBOARD_PAGINATION_DIRECTION,
  type DashboardPaginationState,
} from "~/features/dashboard/shared/pagination";

import {
  buildDashboardAnalyticsHref,
  type DashboardAnalyticsFilters,
  type PostAnalyticsRow,
} from "../state";
import { useDashboardAnalyticsCopy } from "../copy";

interface DashboardAnalyticsTableProps {
  filters: DashboardAnalyticsFilters;
  pagination: DashboardPaginationState;
  posts: PostAnalyticsRow[];
}

export function DashboardAnalyticsTable({
  filters,
  pagination,
  posts,
}: DashboardAnalyticsTableProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardAnalyticsCopy();

  const listHrefState = {
    search: filters.searchQuery,
  } as const;

  const columns: DataTableColumn<PostAnalyticsRow>[] = [
    {
      id: "title",
      header: copy.tableNameLabel,
      cellClassName: "font-bold",
      render: (post) => (
        <div className="space-y-1">
          <p className="font-display text-lg leading-tight text-stone-900 dark:text-stone-100">
            {post.title.toUpperCase().replaceAll(" ", "_")}
          </p>
          <span className="font-mono text-xs opacity-60">/{post.slug}</span>
        </div>
      ),
    },
    {
      id: "views",
      header: copy.tableViewsLabel,
      headerClassName: "text-right",
      cellClassName: "text-right font-mono font-bold text-stone-950 dark:text-stone-50",
      render: (post) => String(post.viewsCount),
    },
    {
      id: "scrollRate",
      header: copy.tableScrollRateLabel,
      headerClassName: "text-right",
      cellClassName: "text-right font-mono",
      render: (post) => `${post.avgScrollRate}%`,
    },
    {
      id: "timeSpent",
      header: copy.tableTimeSpentLabel,
      headerClassName: "text-right",
      cellClassName: "text-right font-mono",
      render: (post) => `${post.avgSecondsSpent}s`,
    },
    {
      id: "actions",
      header: copy.tableActionsLabel,
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (post) => (
        <Button asChild size="sm" className="text-xs tracking-[0.12em] uppercase">
          <Link
            to={to(
              buildDashboardAnalyticsHref({
                ...listHrefState,
                view: post.id,
                cursor: pagination.currentCursor,
                direction: pagination.direction,
              }),
            )}
          >
            <BarChart3 className="size-4" aria-hidden="true" />
            {t("dashboard.analytics.chartTooltipViews")}
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-stone-800">
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          getRowKey={(post) => post.id}
          rows={posts}
          emptyState={copy.emptyState}
        />
      </div>

      <DashboardPaginationControls
        nextHref={
          pagination.hasNextPage && pagination.nextCursor
            ? buildDashboardAnalyticsHref({
                cursor: pagination.nextCursor,
                direction: DASHBOARD_PAGINATION_DIRECTION.next,
                search: filters.searchQuery,
              })
            : null
        }
        nextLabel={copy.paginationNextLabel}
        previousHref={
          pagination.hasPreviousPage && pagination.previousCursor
            ? buildDashboardAnalyticsHref({
                cursor: pagination.previousCursor,
                direction: DASHBOARD_PAGINATION_DIRECTION.previous,
                search: filters.searchQuery,
              })
            : null
        }
        previousLabel={copy.paginationPreviousLabel}
      />
    </div>
  );
}
