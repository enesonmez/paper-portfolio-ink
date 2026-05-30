import { Link } from "react-router";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import { DashboardAnalyticsChart } from "~/features/dashboard/analytics/components/dashboard-analytics-chart";
import { POST_STATUS } from "~/domain/posts/model";
import { LocalDateTime } from "~/components/ui/local-date-time";
import { useDashboardOverviewCopy } from "./copy";

export interface DashboardOverviewScreenProps {
  stats: {
    postCount: number | null;
    projectCount: number | null;
    activeUserCount: number | null;
    skillCount: number | null;
  };
  recentLogs: {
    id: string;
    action: string;
    resource: string;
    result: string;
    message: string;
    createdAt: number;
  }[];
  recentPosts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    status: string;
    updatedAt: number;
  }[];
  analytics: {
    enabled: boolean;
    dailyViews: { date: string; count: number }[];
    monthlyViews: { month: string; count: number }[];
  };
}

export default function DashboardOverviewScreen({
  stats,
  recentLogs,
  recentPosts,
  analytics,
}: DashboardOverviewScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { columns: columnLabels, copy } = useDashboardOverviewCopy();

  const statsList = [
    {
      label: t("dashboard.overview.stat.totalPosts.label"),
      value:
        stats.postCount !== null
          ? stats.postCount.toString()
          : t("dashboard.overview.stat.unauthorized"),
      delta: stats.postCount !== null ? undefined : "N/A",
    },
    {
      label: t("dashboard.overview.stat.totalProjects.label"),
      value:
        stats.projectCount !== null
          ? stats.projectCount.toString()
          : t("dashboard.overview.stat.unauthorized"),
      delta: stats.projectCount !== null ? undefined : "N/A",
    },
    {
      label: t("dashboard.overview.stat.activeUsers.label"),
      value:
        stats.activeUserCount !== null
          ? stats.activeUserCount.toString()
          : t("dashboard.overview.stat.unauthorized"),
      delta: stats.activeUserCount !== null ? undefined : "N/A",
    },
    {
      label: t("dashboard.overview.stat.totalSkills.label"),
      value:
        stats.skillCount !== null
          ? stats.skillCount.toString()
          : t("dashboard.overview.stat.unauthorized"),
      delta: stats.skillCount !== null ? undefined : "N/A",
    },
  ];

  const columns: DataTableColumn<(typeof recentPosts)[number]>[] = [
    {
      header: columnLabels.title,
      id: "title",
      render: (post) => (
        <div>
          <p className="text-foreground font-sans text-sm font-bold">{post.title}</p>
          <span className="text-muted-foreground font-mono text-[10px]">
            {post.slug}
          </span>
        </div>
      ),
    },
    {
      header: columnLabels.status,
      id: "status",
      render: (post) => {
        let statusToneClassName = "text-stone-500";
        if (post.status === POST_STATUS.published) {
          statusToneClassName = "text-green-600 dark:text-green-400";
        } else if (post.status === POST_STATUS.draft) {
          statusToneClassName = "text-amber-600 dark:text-amber-400";
        }
        return (
          <span
            className={`font-sans text-xs font-bold uppercase ${statusToneClassName}`}
          >
            {post.status}
          </span>
        );
      },
    },
    {
      header: columnLabels.actions,
      headerClassName: "text-right",
      id: "actions",
      render: (post) => (
        <div className="flex justify-end gap-2">
          <Button
            asChild
            variant="default"
            size="sm"
            className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            aria-label={`${t("common.edit")} ${post.title}`}
          >
            <Link to={to(`/dashboard/posts?edit=${post.id}`)}>{t("common.edit")}</Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsList.map((stat) => (
          <DashboardMetricCard
            key={stat.label}
            label={stat.label}
            meta={stat.delta}
            value={stat.value}
          />
        ))}
      </section>

      {analytics.enabled &&
        (analytics.dailyViews.length > 0 || analytics.monthlyViews.length > 0) && (
          <section className="space-y-4">
            <DashboardSectionHeading
              eyebrow={t("dashboard.overview.analyticsEyebrow")}
              title={t("dashboard.overview.analyticsTitle")}
              action={
                <Button
                  asChild
                  variant="secondary"
                  className="w-full tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none md:w-auto"
                >
                  <Link to={to("/dashboard/analytics")}>
                    {t("dashboard.overview.viewAnalyticsActionLabel")}
                  </Link>
                </Button>
              }
            />
            <DashboardAnalyticsChart
              dailyData={analytics.dailyViews}
              monthlyData={analytics.monthlyViews}
            />
          </section>
        )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <section className="space-y-4">
          <DashboardSectionHeading
            action={
              <Button
                asChild
                className="w-full tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none md:w-auto"
              >
                <Link to={to("/dashboard/posts?modal=create")}>
                  {copy.createPostActionLabel}
                </Link>
              </Button>
            }
            eyebrow={copy.contentPipelineEyebrow}
            title={copy.contentPipelineTitle}
          />

          <DashboardPanel className="overflow-x-auto p-0">
            {recentPosts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground font-sans text-sm font-bold">
                  {t("dashboard.overview.recentPostsEmpty")}
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                getRowKey={(post) => post.id}
                rows={recentPosts}
              />
            )}
          </DashboardPanel>
        </section>

        <aside className="space-y-4">
          <DashboardSectionHeading
            eyebrow={copy.runtimeFeedEyebrow}
            level={2}
            title={copy.runtimeFeedTitle}
          />

          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <DashboardPanel>
                <p className="text-muted-foreground text-center font-sans text-xs font-bold">
                  {t("dashboard.overview.recentLogsEmpty")}
                </p>
              </DashboardPanel>
            ) : (
              recentLogs.map((log) => {
                const toneClassName =
                  log.result === "success"
                    ? "bg-green-500 text-white"
                    : "bg-destructive text-destructive-foreground";

                return (
                  <DashboardPanel key={log.id}>
                    <div className="flex items-start gap-4">
                      <div
                        className={`shrink-0 border-2 border-black px-3 py-2 ${toneClassName}`}
                      >
                        <span className="font-sans text-[10px] font-bold uppercase">
                          {copy.logBadge}
                        </span>
                      </div>
                      <div>
                        <p className="text-foreground font-sans text-sm font-bold tracking-[0.06em] uppercase">
                          {log.message}
                        </p>
                        <p className="text-muted-foreground mt-2 font-sans text-[10px] font-bold tracking-[0.18em] uppercase">
                          <LocalDateTime value={new Date(log.createdAt)} />
                        </p>
                      </div>
                    </div>
                  </DashboardPanel>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
