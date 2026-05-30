import { Form, Link } from "react-router";
import { PenSquare, Search } from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { SelectField, TextField } from "~/components/ui/form-field";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import type { PostOverview } from "~/lib/posts/posts.server";

import { useDashboardPostsCopy } from "./copy";
import {
  DASHBOARD_POSTS_MODAL,
  DASHBOARD_POSTS_QUERY_PARAM,
  buildDashboardPostsHref,
  useDashboardPostStatusFilterOptions,
  type DashboardPostsFilters,
  type DashboardPostsFormState,
  type DashboardPostsMetrics,
  type DashboardPostsPermissions,
} from "./state";
import { DashboardPostsComposeView } from "./components/dashboard-posts-compose-view";
import { DashboardPostsTable } from "./components/dashboard-posts-table";
import type { DashboardPaginationState } from "../shared/pagination";

export interface DashboardPostsScreenProps {
  actionError?: string;
  filters: DashboardPostsFilters;
  form: DashboardPostsFormState;
  metrics: DashboardPostsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardPostsPermissions;
  posts: PostOverview[];
}

export function DashboardPostsScreen({
  actionError,
  filters,
  form,
  metrics,
  pagination,
  permissions,
  posts,
}: DashboardPostsScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardPostsCopy();
  const statusOptions = useDashboardPostStatusFilterOptions();
  const listHrefState = {
    cursor: pagination.currentCursor,
    direction: pagination.direction,
    search: filters.searchQuery,
    status: filters.status,
  } as const;

  if (form.isOpen) {
    return <DashboardPostsComposeView form={form} listHrefState={listHrefState} />;
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label={t("dashboard.posts.metricTotal")}
          value={String(metrics.totalCount)}
        />
        <DashboardMetricCard
          accent="primary"
          label={t("dashboard.posts.metricPublished")}
          value={String(metrics.publishedCount)}
        />
        <DashboardMetricCard
          label={t("dashboard.posts.metricDraft")}
          value={String(metrics.draftCount)}
        />
      </section>

      <section className="space-y-4">
        <DashboardSectionHeading
          eyebrow={copy.inventoryEyebrow}
          title={copy.registryTitle}
          action={
            permissions.canCreate ? (
              <Button
                asChild
                className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Link
                  to={to(
                    buildDashboardPostsHref({
                      ...listHrefState,
                      modal: DASHBOARD_POSTS_MODAL.create,
                    }),
                  )}
                >
                  <PenSquare className="size-4" aria-hidden="true" />
                  {copy.createActionLabel}
                </Link>
              </Button>
            ) : null
          }
        />

        <DashboardPanel className="space-y-4">
          <Form
            method="get"
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem_auto_auto]"
          >
            <TextField
              defaultValue={filters.searchQuery}
              label={copy.searchLabel}
              name={DASHBOARD_POSTS_QUERY_PARAM.search}
              placeholder={copy.searchPlaceholder}
            />
            <SelectField
              defaultValue={filters.status}
              label={copy.statusFilterLabel}
              name={DASHBOARD_POSTS_QUERY_PARAM.status}
              options={statusOptions}
            />
            <Button type="submit" className="self-end">
              <Search className="size-4" aria-hidden="true" />
              {copy.searchActionLabel}
            </Button>
            <Button asChild className="self-end" variant="secondary">
              <Link to={to(buildDashboardPostsHref())}>{copy.clearFiltersLabel}</Link>
            </Button>
          </Form>
        </DashboardPanel>

        <DashboardPostsTable
          filters={filters}
          pagination={pagination}
          permissions={permissions}
          posts={posts}
        />
      </section>

      {actionError ? (
        <DashboardModal
          title={copy.actionBlockedTitle}
          description={actionError}
          to={to(buildDashboardPostsHref(listHrefState))}
        >
          <div className="space-y-4">
            <DashboardPanel className="bg-destructive text-destructive-foreground">
              <p className="font-sans text-sm font-bold" role="alert">
                {actionError}
              </p>
            </DashboardPanel>
            <div className="flex justify-end">
              <Button asChild className="tracking-[0.14em]">
                <Link to={to(buildDashboardPostsHref(listHrefState))}>
                  {t("common.dismiss")}
                </Link>
              </Button>
            </div>
          </div>
        </DashboardModal>
      ) : null}
    </div>
  );
}

export function DashboardPostsAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  const { copy } = useDashboardPostsCopy();

  return (
    <DashboardAuthorizationAccessDeniedScreen
      currentRoleLabel={copy.currentRoleLabel}
      description={copy.restrictedDescription}
      title={copy.restrictedTitle}
      viewerRole={viewerRole}
    />
  );
}
