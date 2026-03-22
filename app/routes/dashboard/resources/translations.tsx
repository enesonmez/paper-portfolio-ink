import type { Route } from "./+types/translations";

import { handleDashboardResourcesAction } from "~/features/dashboard/resources/server";

export async function action({ context, request }: Route.ActionArgs) {
  return handleDashboardResourcesAction(context, request);
}

export { default } from "~/features/dashboard/resources/translations/screen";
