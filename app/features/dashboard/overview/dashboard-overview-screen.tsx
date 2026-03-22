import { Link } from "react-router";

import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";

import { useDashboardOverviewCopy } from "./dashboard-overview.constants";

export default function DashboardOverviewScreen() {
  const t = useT();
  const to = useLocalizedPath();
  const {
    columns: columnLabels,
    copy,
    logs,
    posts,
    stats,
  } = useDashboardOverviewCopy();
  const columns: DataTableColumn<(typeof posts)[number]>[] = [
    {
      header: columnLabels.title,
      id: "title",
      render: (post) => (
        <p className="text-foreground font-sans text-sm font-bold">{post.title}</p>
      ),
    },
    {
      header: columnLabels.category,
      id: "category",
      render: (post) => (
        <span className="bg-primary/20 text-foreground inline-flex border-2 border-black px-2 py-1 font-sans text-[10px] font-bold tracking-[0.14em] uppercase">
          {post.category}
        </span>
      ),
    },
    {
      header: columnLabels.status,
      id: "status",
      render: (post) => (
        <span
          className={`font-sans text-xs font-bold uppercase ${post.statusToneClassName}`}
        >
          {post.status}
        </span>
      ),
    },
    {
      header: columnLabels.actions,
      headerClassName: "text-right",
      id: "actions",
      render: (post) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            aria-label={`${t("common.edit")} ${post.title}`}
          >
            {t("common.edit")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            aria-label={`${t("common.delete")} ${post.title}`}
          >
            {t("common.delete")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <DashboardMetricCard
            key={stat.label}
            label={stat.label}
            meta={stat.delta}
            value={stat.value}
          />
        ))}
      </section>

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
            <DataTable
              columns={columns}
              getRowKey={(post) => post.title}
              rows={posts}
            />
          </DashboardPanel>
        </section>

        <aside className="space-y-4">
          <DashboardSectionHeading
            eyebrow={copy.runtimeFeedEyebrow}
            level={2}
            title={copy.runtimeFeedTitle}
          />

          <div className="space-y-4">
            {logs.map((log) => (
              <DashboardPanel key={log.title}>
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 border-2 border-black px-3 py-2 ${log.toneClassName}`}
                  >
                    <span className="font-sans text-[10px] font-bold uppercase">
                      {copy.logBadge}
                    </span>
                  </div>
                  <div>
                    <p className="text-foreground font-sans text-sm font-bold tracking-[0.06em] uppercase">
                      {log.title}
                    </p>
                    <p className="text-muted-foreground mt-2 font-sans text-[10px] font-bold tracking-[0.18em] uppercase">
                      {log.time}
                    </p>
                  </div>
                </div>
              </DashboardPanel>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
