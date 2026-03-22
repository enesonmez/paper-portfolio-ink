import { useOutletContext } from "react-router";

import type { DashboardResourcesRouteContext } from "../state";

export function useDashboardResourcesRouteContext() {
  return useOutletContext<DashboardResourcesRouteContext>();
}
