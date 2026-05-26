import { Pencil, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardPaginationControls } from "~/components/dashboard/pagination-controls";
import { DashboardStatusBadge } from "~/components/dashboard/status-badge";
import { Button } from "~/components/ui/button";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import { POST_FORM_FIELD, POST_MUTATION_INTENT } from "~/domain/posts/model";
import type { PostOverview } from "~/lib/posts/posts.server";

import { useDashboardPostsCopy } from "../copy";
import {
  buildDashboardPostsHref,
  formatDashboardPostTitle,
  getPostStatusTone,
  type DashboardPostsFilters,
  type DashboardPostsPermissions,
} from "../state";
import type { DashboardPaginationState } from "../../shared/pagination";

interface DashboardPostsTableProps {
  filters: DashboardPostsFilters;
  pagination: DashboardPaginationState;
  permissions: DashboardPostsPermissions;
  posts: PostOverview[];
}

export function DashboardPostsTable({
  filters,
  pagination,
  permissions,
  posts,
}: DashboardPostsTableProps) {
  const { copy } = useDashboardPostsCopy();
  const to = useLocalizedPath();
  const t = useT();
  const listHrefState = {
    cursor: pagination.currentCursor,
    direction: pagination.direction,
    search: filters.searchQuery,
    status: filters.status,
  } as const;

  const columns: DataTableColumn<PostOverview>[] = [
    {
      cellClassName: "align-top",
      header: copy.tableNameLabel,
      id: "title",
      render: (post) => (
        <div className="space-y-2">
          <p className="font-display text-3xl leading-none uppercase">
            {formatDashboardPostTitle(post.title)}
          </p>
          <div className="text-muted-foreground flex flex-wrap gap-3 text-[11px] font-bold tracking-[0.12em] uppercase">
            <span>{post.slug}</span>
            <span>
              {t("dashboard.posts.createdLabel")} {post.createdAtLabel}
            </span>
          </div>
        </div>
      ),
    },
    {
      cellClassName: "align-top",
      header: copy.tableSummaryLabel,
      id: "summary",
      render: (post) => (
        <>
          <p className="text-foreground text-sm font-bold">{post.excerpt}</p>
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-[11px] font-bold tracking-[0.12em] uppercase">
            <span>
              {t("dashboard.posts.updatedLabel")} {post.updatedAtLabel}
            </span>
            {post.publishedAtLabel ? (
              <span>
                {t("dashboard.posts.publishedAtLabel")} {post.publishedAtLabel}
              </span>
            ) : null}
          </div>
        </>
      ),
    },
    {
      cellClassName: "align-top",
      header: copy.tableStatusLabel,
      id: "status",
      render: (post) => (
        <DashboardStatusBadge
          label={post.status}
          tone={getPostStatusTone(post.status)}
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
      render: (post) => (
        <div className="flex justify-end gap-2">
          {permissions.canUpdate ? (
            <Button
              asChild
              size="iconSm"
              className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              aria-label={`${t("aria.projects.edit")} ${formatDashboardPostTitle(post.title)}`}
            >
              <Link
                to={to(
                  buildDashboardPostsHref({
                    ...listHrefState,
                    editId: post.id,
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
                name={POST_FORM_FIELD.intent}
                value={POST_MUTATION_INTENT.delete}
              />
              <input type="hidden" name={POST_FORM_FIELD.postId} value={post.id} />
              <Button
                type="submit"
                variant="destructive"
                size="iconSm"
                className="cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                aria-label={`${t("aria.projects.delete")} ${formatDashboardPostTitle(post.title)}`}
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
        getRowKey={(post) => post.id}
        rows={posts}
        bodyClassName="font-sans"
      />

      <DashboardPaginationControls
        nextHref={
          pagination.hasNextPage && pagination.nextCursor
            ? buildDashboardPostsHref({
                search: filters.searchQuery,
                status: filters.status,
                cursor: pagination.nextCursor,
                direction: "next",
              })
            : null
        }
        nextLabel={copy.paginationNextLabel}
        previousHref={
          pagination.hasPreviousPage && pagination.previousCursor
            ? buildDashboardPostsHref({
                search: filters.searchQuery,
                status: filters.status,
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
