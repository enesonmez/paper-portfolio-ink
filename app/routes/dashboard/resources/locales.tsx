import type { Route } from "./+types/locales";

import { handleDashboardResourcesAction } from "~/features/dashboard/resources/server";

export async function action({ context, request }: Route.ActionArgs) {
  return handleDashboardResourcesAction(context, request);
}

export { default } from "~/features/dashboard/resources/locales/screen";
