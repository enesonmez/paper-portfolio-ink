import type { AppLoadContext } from "react-router";

import { assertAuthorized, withDashboardAccess } from "~/shared/authz/authz.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";

import {
  buildResourcesPermissions,
  canReadResourceSection,
  hasResourceReadAccess,
  type DashboardResourcesPermissions,
} from "./access/permissions";
import { listResourceLocalesForDashboard } from "./locales/loader/queries.server";
import {
  resolveDashboardResourcesSection,
  resolveDashboardResourcesTranslationLocale,
} from "./routing/href";
import {
  getRequestedOrFallbackLocale,
  redirectToResources,
} from "./routing/navigation.server";
import {
  buildDashboardResourcesMetrics,
  buildDeniedDashboardResourcesLoaderData,
  resolveDashboardResourcesState,
  type DashboardResourcesLoaderData,
} from "./state";
import {
  resolveTranslationViewStateFromUrl,
  sanitizeTranslationModalAccess,
} from "./translations/loader/request.server";
import { loadDashboardTranslationListing } from "./translations/loader/queries.server";

function resolveAccessibleResourcesSection(permissions: DashboardResourcesPermissions) {
  return permissions.translations.canRead ? "translations" : "locales";
}

async function loadAuthorizedResourcesData(args: {
  context: AppLoadContext;
  permissions: DashboardResourcesPermissions;
  request: Request;
}): Promise<DashboardResourcesLoaderData | Response> {
  const localeRows = await listResourceLocalesForDashboard(args.context);
  const url = new URL(args.request.url);
  const currentSection = resolveDashboardResourcesSection(url.pathname);
  const canReadTranslations = args.permissions.translations.canRead;
  const sanitizedModal = sanitizeTranslationModalAccess(
    url.searchParams.get("modal"),
    canReadTranslations,
  );

  if (!canReadResourceSection(args.permissions, currentSection)) {
    return redirectToResources({
      currentLocale: getRequestedOrFallbackLocale(args.request, localeRows),
      localeRows,
      section: resolveAccessibleResourcesSection(args.permissions),
      translationLocale: resolveDashboardResourcesTranslationLocale(null, localeRows),
      translationSearch: "",
    });
  }

  const translationRequestState = resolveTranslationViewStateFromUrl({
    canReadTranslations,
    localeRows,
    url,
  });
  const translationState = await loadDashboardTranslationListing({
    context: args.context,
    localeRows,
    requestState: translationRequestState,
  });
  const { localeForm, translationForm } = resolveDashboardResourcesState({
    editLocaleCode: url.searchParams.get("editLocaleCode"),
    editTranslationKey: translationRequestState.editTranslationKey,
    editTranslationLocale: translationRequestState.editTranslationLocale,
    localeRows,
    modal: sanitizedModal,
    selectedTranslationLocale: translationState.selectedLocale,
    translationRecord: translationState.record,
  });

  return {
    access: "granted",
    localeForm,
    locales: localeRows,
    metrics: buildDashboardResourcesMetrics(
      localeRows,
      translationState.selectedLocaleTranslationCount,
    ),
    permissions: args.permissions,
    selectedTranslationLocale: translationState.selectedLocale,
    translationPagination: translationState.pagination,
    translationSearchQuery: translationState.searchQuery,
    translationForm,
    translations: translationState.rows,
  };
}

export async function loadDashboardResourcesData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardResourcesLoaderData | Response> {
  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) => {
      const permissions = buildResourcesPermissions(actor);

      assertAuthorized<DashboardResourcesLoaderData>({
        error: {
          action: APP_ERROR_ACTION.read,
          code: APP_ERROR_CODE.resources.read.forbidden,
          message: "Resource dashboard access denied",
          resource: APP_ERROR_RESOURCE.resources,
          responseData: buildDeniedDashboardResourcesLoaderData(),
          status: 403,
        },
        isAllowed: hasResourceReadAccess(permissions),
      });
    },
    handle: ({ actor }) =>
      loadAuthorizedResourcesData({
        context,
        permissions: buildResourcesPermissions(actor),
        request,
      }),
  });
}
