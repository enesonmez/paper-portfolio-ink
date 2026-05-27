import { useLoaderData, useOutletContext } from "react-router";

import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";
import {
  DashboardAnalyticsAccessDeniedScreen,
  DashboardAnalyticsScreen,
} from "./screen";
import type { DashboardAnalyticsLoaderData } from "./state";

export {
  DashboardAnalyticsAccessDeniedScreen,
  DashboardAnalyticsScreen,
} from "./screen";

export default function DashboardAnalyticsRoute() {
  const loaderData = useLoaderData<DashboardAnalyticsLoaderData>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardAnalyticsAccessDeniedScreen viewerRole={user.role} />;
  }

  return (
    <DashboardAnalyticsScreen
      filters={loaderData.filters}
      metrics={loaderData.metrics}
      pagination={loaderData.pagination}
      permissions={loaderData.permissions}
      posts={loaderData.posts}
      dailyViews={loaderData.dailyViews}
      monthlyViews={loaderData.monthlyViews}
      form={loaderData.form}
    />
  );
}
