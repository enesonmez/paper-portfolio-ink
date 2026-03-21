import { Link } from "react-router";
import { PenSquare } from "lucide-react";

import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { useLocalizedPath, useT } from "~/features/i18n/i18n-react";
import type { PostOverview } from "~/lib/posts/posts.server";

import { useDashboardPostsCopy } from "./dashboard-posts.constants";
import {
  buildDashboardPostsHref,
  type DashboardPostsFormState,
  type DashboardPostsMetrics,
} from "./dashboard-posts.shared";
import { DashboardPostsComposeView } from "./components/dashboard-posts-compose-view";
import { DashboardPostsTable } from "./components/dashboard-posts-table";

export interface DashboardPostsScreenProps {
  form: DashboardPostsFormState;
  metrics: DashboardPostsMetrics;
  posts: PostOverview[];
}

export function DashboardPostsScreen({
  form,
  metrics,
  posts,
}: DashboardPostsScreenProps) {
  const t = useT();
  const to = useLocalizedPath();
  const { copy } = useDashboardPostsCopy();

  if (form.isOpen) {
    return <DashboardPostsComposeView form={form} />;
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
            <Button
              asChild
              className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              <Link to={to(buildDashboardPostsHref({ modal: "create" }))}>
                <PenSquare className="size-4" aria-hidden="true" />
                {copy.createActionLabel}
              </Link>
            </Button>
          }
        />

        <DashboardPostsTable posts={posts} />
      </section>
    </div>
  );
}
