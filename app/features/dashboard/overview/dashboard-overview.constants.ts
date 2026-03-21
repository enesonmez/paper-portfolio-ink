import { useT } from "~/features/i18n/i18n-react";
import type { I18nTranslator } from "~/features/i18n/i18n.shared";

export interface DashboardOverviewStat {
  delta: string;
  label: string;
  toneClassName: string;
  value: string;
}

export interface DashboardOverviewPost {
  category: string;
  status: string;
  statusToneClassName: string;
  title: string;
}

export interface DashboardOverviewLog {
  time: string;
  title: string;
  toneClassName: string;
}

export function buildDashboardOverviewStats(
  t: I18nTranslator,
): readonly DashboardOverviewStat[] {
  return [
    {
      delta: "+5%",
      label: t("dashboard.overview.stat.totalPosts.label"),
      toneClassName: "text-green-600 dark:text-green-400",
      value: "42",
    },
    {
      delta: "+12%",
      label: t("dashboard.overview.stat.totalViews.label"),
      toneClassName: "text-green-600 dark:text-green-400",
      value: "12.8K",
    },
    {
      delta: t("dashboard.overview.stat.stable"),
      label: t("dashboard.overview.stat.projectSuccess.label"),
      toneClassName: "text-primary",
      value: "98%",
    },
    {
      delta: t("dashboard.overview.stat.optimal"),
      label: t("dashboard.overview.stat.serverLoad.label"),
      toneClassName: "text-sky-700 dark:text-sky-400",
      value: "14%",
    },
  ] as const;
}

export function buildDashboardOverviewPosts(
  t: I18nTranslator,
): readonly DashboardOverviewPost[] {
  return [
    {
      category: t("dashboard.overview.post.1.category"),
      status: t("dashboard.overview.post.1.status"),
      statusToneClassName: "text-green-600 dark:text-green-400",
      title: t("dashboard.overview.post.1.title"),
    },
    {
      category: t("dashboard.overview.post.2.category"),
      status: t("dashboard.overview.post.2.status"),
      statusToneClassName: "text-amber-600 dark:text-amber-400",
      title: t("dashboard.overview.post.2.title"),
    },
    {
      category: t("dashboard.overview.post.3.category"),
      status: t("dashboard.overview.post.3.status"),
      statusToneClassName: "text-green-600 dark:text-green-400",
      title: t("dashboard.overview.post.3.title"),
    },
  ] as const;
}

export function buildDashboardOverviewLogs(
  t: I18nTranslator,
): readonly DashboardOverviewLog[] {
  return [
    {
      time: t("dashboard.overview.log.1.time"),
      title: t("dashboard.overview.log.1.title"),
      toneClassName: "bg-primary text-black",
    },
    {
      time: t("dashboard.overview.log.2.time"),
      title: t("dashboard.overview.log.2.title"),
      toneClassName: "bg-green-500 text-white",
    },
    {
      time: t("dashboard.overview.log.3.time"),
      title: t("dashboard.overview.log.3.title"),
      toneClassName: "bg-stone-300 text-black dark:bg-stone-600 dark:text-white",
    },
  ] as const;
}

export function useDashboardOverviewCopy() {
  const t = useT();

  return {
    columns: {
      actions: t("dashboard.overview.tableActionsLabel"),
      category: t("dashboard.overview.tableCategoryLabel"),
      status: t("dashboard.overview.tableStatusLabel"),
      title: t("dashboard.overview.tableTitleLabel"),
    },
    copy: {
      contentPipelineEyebrow: t("dashboard.overview.contentPipelineEyebrow"),
      contentPipelineTitle: t("dashboard.overview.contentPipelineTitle"),
      createPostActionLabel: t("dashboard.overview.createPostActionLabel"),
      logBadge: t("dashboard.overview.logBadge"),
      runtimeFeedEyebrow: t("dashboard.overview.runtimeFeedEyebrow"),
      runtimeFeedTitle: t("dashboard.overview.runtimeFeedTitle"),
    },
    logs: buildDashboardOverviewLogs(t),
    posts: buildDashboardOverviewPosts(t),
    stats: buildDashboardOverviewStats(t),
  };
}
