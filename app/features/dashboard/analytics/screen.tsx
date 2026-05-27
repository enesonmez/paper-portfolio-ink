import { Form, Link } from "react-router";
import { Search } from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/form-field";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import type { DashboardPaginationState } from "~/features/dashboard/shared/pagination";

import { useDashboardAnalyticsCopy } from "./copy";
import {
  buildDashboardAnalyticsHref,
  DASHBOARD_ANALYTICS_QUERY_PARAM,
  type DashboardAnalyticsFilters,
  type DashboardAnalyticsMetrics,
  type DashboardAnalyticsPermissions,
  type PostAnalyticsRow,
  type ViewsDataPoint,
  type MonthlyViewsDataPoint,
  type DashboardAnalyticsFormState,
} from "./state";
import { DashboardAnalyticsChart } from "./components/dashboard-analytics-chart";
import { DashboardAnalyticsTable } from "./components/dashboard-analytics-table";

export interface DashboardAnalyticsScreenProps {
  filters: DashboardAnalyticsFilters;
  metrics: DashboardAnalyticsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardAnalyticsPermissions;
  posts: PostAnalyticsRow[];
  dailyViews: ViewsDataPoint[];
  monthlyViews: MonthlyViewsDataPoint[];
  form: DashboardAnalyticsFormState;
}

export function DashboardAnalyticsScreen({
  filters,
  metrics,
  pagination,
  posts,
  dailyViews,
  monthlyViews,
  form,
}: DashboardAnalyticsScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardAnalyticsCopy();

  const listHrefState = {
    search: filters.searchQuery,
    cursor: pagination.currentCursor,
    direction: pagination.direction,
  } as const;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardMetricCard
          accent="primary"
          label={copy.metricTotalViews}
          value={String(metrics.totalViews)}
        />
        <DashboardMetricCard
          label={copy.metricAvgScrollRate}
          value={`${metrics.avgScrollRate}%`}
        />
        <DashboardMetricCard
          label={copy.metricAvgTimeSpent}
          value={`${metrics.avgTimeSpent}s`}
        />
      </section>

      <section className="space-y-4">
        <DashboardSectionHeading eyebrow={copy.pageEyebrow} title={copy.pageTitle} />
        <DashboardAnalyticsChart dailyData={dailyViews} monthlyData={monthlyViews} />
      </section>

      <section className="space-y-4">
        <DashboardSectionHeading
          eyebrow={copy.inventoryEyebrow}
          title={copy.registryTitle}
        />

        <DashboardPanel className="space-y-4">
          <Form
            method="get"
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
          >
            <TextField
              defaultValue={filters.searchQuery}
              label={copy.searchLabel}
              name={DASHBOARD_ANALYTICS_QUERY_PARAM.search}
              placeholder={copy.searchPlaceholder}
            />
            <Button type="submit" className="self-end">
              <Search className="size-4" aria-hidden="true" />
              {copy.searchActionLabel}
            </Button>
            <Button asChild className="self-end" variant="secondary">
              <Link to={to(buildDashboardAnalyticsHref())}>
                {copy.clearFiltersLabel}
              </Link>
            </Button>
          </Form>
        </DashboardPanel>

        <DashboardAnalyticsTable
          filters={filters}
          pagination={pagination}
          posts={posts}
        />
      </section>

      {form.isOpen && form.viewId ? (
        <DashboardModal
          title={`${form.selectedPostTitle}`}
          description={copy.modalDescription}
          to={to(buildDashboardAnalyticsHref(listHrefState))}
        >
          <div className="space-y-6">
            <DashboardAnalyticsChart
              dailyData={form.postDailyViews}
              monthlyData={form.postMonthlyViews}
            />
            <div className="flex justify-end border-t border-black/10 pt-4">
              <Button asChild className="text-xs tracking-[0.14em] uppercase">
                <Link to={to(buildDashboardAnalyticsHref(listHrefState))}>
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

export function DashboardAnalyticsAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  const { copy } = useDashboardAnalyticsCopy();

  return (
    <DashboardAuthorizationAccessDeniedScreen
      currentRoleLabel={copy.currentRoleLabel}
      description={copy.restrictedDescription}
      title={copy.restrictedTitle}
      viewerRole={viewerRole}
    />
  );
}
