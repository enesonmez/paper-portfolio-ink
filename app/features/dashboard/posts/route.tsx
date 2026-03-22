import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { PostFormState } from "~/domain/posts/form";
import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import { DashboardPostsAccessDeniedScreen, DashboardPostsScreen } from "./screen";
import { mergeDashboardPostsFormState, type DashboardPostsLoaderData } from "./state";

export { DashboardPostsAccessDeniedScreen, DashboardPostsScreen } from "./screen";

export default function DashboardPostsRoute() {
  const loaderData = useLoaderData<DashboardPostsLoaderData>();
  const actionData = useActionData<PostFormState>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardPostsAccessDeniedScreen viewerRole={user.role} />;
  }

  return (
    <DashboardPostsScreen
      form={mergeDashboardPostsFormState(loaderData.form, actionData)}
      metrics={loaderData.metrics}
      permissions={loaderData.permissions}
      posts={loaderData.posts}
    />
  );
}
