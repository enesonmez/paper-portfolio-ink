import {
  Outlet,
  useActionData,
  useLoaderData,
  useLocation,
  useOutletContext,
} from "react-router";

import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import { resolveDashboardResourcesSection } from "../href";
import {
  mergeDashboardResourcesLocaleFormState,
  mergeDashboardResourcesTranslationFormState,
  type DashboardResourcesActionState,
  type DashboardResourcesLoaderData,
  type DashboardResourcesRouteContext,
} from "../state";
import {
  DashboardResourcesAccessDeniedScreen,
  DashboardResourcesLayout,
} from "./screen";

export { DashboardResourcesAccessDeniedScreen };

export default function DashboardResourcesRoute() {
  const loaderData = useLoaderData<DashboardResourcesLoaderData>();
  const actionData = useActionData<DashboardResourcesActionState>();
  const location = useLocation();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardResourcesAccessDeniedScreen viewerRole={user.role} />;
  }

  const routeContext: DashboardResourcesRouteContext = {
    localeForm: mergeDashboardResourcesLocaleFormState(
      loaderData.localeForm,
      actionData,
    ),
    locales: loaderData.locales,
    metrics: loaderData.metrics,
    permissions: loaderData.permissions,
    selectedTranslationLocale: loaderData.selectedTranslationLocale,
    translationPagination: loaderData.translationPagination,
    translationSearchQuery: loaderData.translationSearchQuery,
    translationForm: mergeDashboardResourcesTranslationFormState(
      loaderData.translationForm,
      actionData,
    ),
    translations: loaderData.translations,
  };

  return (
    <DashboardResourcesLayout
      actionError={actionData?.actionError}
      currentSection={resolveDashboardResourcesSection(location.pathname)}
      metrics={loaderData.metrics}
      permissions={loaderData.permissions}
      selectedTranslationLocale={loaderData.selectedTranslationLocale}
      translationPagination={loaderData.translationPagination}
      translationSearchQuery={loaderData.translationSearchQuery}
    >
      <Outlet context={routeContext} />
    </DashboardResourcesLayout>
  );
}
