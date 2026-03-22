import { useActionData, useLoaderData } from "react-router";

import type { PostFormState } from "~/domain/posts/form";

import { DashboardPostsScreen } from "./screen";
import { mergeDashboardPostsFormState, type DashboardPostsLoaderData } from "./state";

export { DashboardPostsScreen } from "./screen";

export default function DashboardPostsRoute() {
  const loaderData = useLoaderData<DashboardPostsLoaderData>();
  const actionData = useActionData<PostFormState>();

  return (
    <DashboardPostsScreen
      form={mergeDashboardPostsFormState(loaderData.form, actionData)}
      metrics={loaderData.metrics}
      posts={loaderData.posts}
    />
  );
}
