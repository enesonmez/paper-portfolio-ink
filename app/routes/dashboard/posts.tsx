import type { Route } from "./+types/posts";

import DashboardPostsRoute, {
  DashboardPostsAccessDeniedScreen,
  DashboardPostsScreen,
} from "~/features/dashboard/posts/route";
import {
  handleDashboardPostsAction,
  loadDashboardPostsData,
} from "~/features/dashboard/posts/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadDashboardPostsData(context, request);
}

export async function action({ context, request }: Route.ActionArgs) {
  return handleDashboardPostsAction(context, request);
}

export { DashboardPostsAccessDeniedScreen, DashboardPostsScreen };

export default DashboardPostsRoute;
