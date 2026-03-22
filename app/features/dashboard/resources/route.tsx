import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import {
  DashboardResourcesAccessDeniedScreen,
  DashboardResourcesScreen,
} from "./screen";
import {
  mergeDashboardResourcesLocaleFormState,
  mergeDashboardResourcesTranslationFormState,
  type DashboardResourcesActionState,
  type DashboardResourcesLoaderData,
} from "./state";

export { DashboardResourcesAccessDeniedScreen, DashboardResourcesScreen };

export default function DashboardResourcesRoute() {
  const loaderData = useLoaderData<DashboardResourcesLoaderData>();
  const actionData = useActionData<DashboardResourcesActionState>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardResourcesAccessDeniedScreen viewerRole={user.role} />;
  }

  return (
    <DashboardResourcesScreen
      actionError={actionData?.actionError}
      activeTab={loaderData.activeTab}
      localeForm={mergeDashboardResourcesLocaleFormState(
        loaderData.localeForm,
        actionData,
      )}
      locales={loaderData.locales}
      metrics={loaderData.metrics}
      selectedTranslationLocale={loaderData.selectedTranslationLocale}
      translationPagination={loaderData.translationPagination}
      translationSearchQuery={loaderData.translationSearchQuery}
      translationForm={mergeDashboardResourcesTranslationFormState(
        loaderData.translationForm,
        actionData,
      )}
      translations={loaderData.translations}
    />
  );
}
