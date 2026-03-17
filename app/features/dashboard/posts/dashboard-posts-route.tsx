import { useActionData, useLoaderData } from "react-router";

import type { PostFormState } from "~/features/posts/post-form.shared";

import { DashboardPostsScreen } from "./dashboard-posts-screen";
import {
  mergeDashboardPostsFormState,
  type DashboardPostsLoaderData,
} from "./dashboard-posts.shared";

export { DashboardPostsScreen } from "./dashboard-posts-screen";

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
