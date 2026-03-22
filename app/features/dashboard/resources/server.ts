import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/domain/resources/contract";
import {
  resolveMutationClaim,
  RESOURCE_MUTATION_CLAIMS,
} from "~/shared/authz/action-claims";
import {
  denyActionIfMissingClaim,
  requireDashboardActor,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { readStringField } from "~/shared/forms/form-data.server";
import {
  findTranslation,
  listLocales,
  listTranslationsByLocale,
} from "~/lib/resources/resources.server";

import { buildDashboardResourcesFormCopy } from "./copy";
import { buildActionErrorState } from "./action-state.server";
import {
  DASHBOARD_RESOURCES_MODAL,
  DASHBOARD_RESOURCES_SECTION,
  DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
  normalizeDashboardResourcesPage,
  normalizeDashboardResourcesSearchQuery,
  resolveDashboardResourcesSection,
  resolveDashboardResourcesTranslationLocale,
} from "./href";
import { handleLocaleResourceMutation } from "./locale-actions.server";
import { getRequestedOrFallbackLocale, redirectToResources } from "./navigation.server";
import {
  buildResourcesPermissions,
  canReadResourceSection,
  hasResourceReadAccess,
} from "./permissions";
import {
  buildDashboardResourcesMetrics,
  buildDashboardResourcesTranslationPagination,
  resolveDashboardResourcesState,
  type DashboardResourcesLoaderData,
} from "./state";
import { handleTranslationResourceMutation } from "./translation-actions.server";

function isLocaleMutationIntent(intent: string) {
  return (
    intent === RESOURCE_MUTATION_INTENT.createLocale ||
    intent === RESOURCE_MUTATION_INTENT.deleteLocale ||
    intent === RESOURCE_MUTATION_INTENT.updateLocale
  );
}

function isTranslationMutationIntent(intent: string) {
  return (
    intent === RESOURCE_MUTATION_INTENT.createTranslation ||
    intent === RESOURCE_MUTATION_INTENT.deleteTranslation ||
    intent === RESOURCE_MUTATION_INTENT.updateTranslation
  );
}

function sanitizeResourcesModal(modal: string | null, canReadTranslations: boolean) {
  if (
    !canReadTranslations &&
    (modal === DASHBOARD_RESOURCES_MODAL.createTranslation ||
      modal === DASHBOARD_RESOURCES_MODAL.editTranslation)
  ) {
    return null;
  }

  return modal;
}

export async function loadDashboardResourcesData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardResourcesLoaderData | Response> {
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  const permissions = buildResourcesPermissions(auth.actor);

  if (!hasResourceReadAccess(permissions)) {
    return {
      access: "denied",
    };
  }

  const db = getDbFromContext(context);
  const localeRows = await listLocales(db);
  const url = new URL(request.url);
  const currentSection = resolveDashboardResourcesSection(url.pathname);
  const canReadTranslations = permissions.translations.canRead;
  const sanitizedModal = sanitizeResourcesModal(
    url.searchParams.get("modal"),
    canReadTranslations,
  );

  if (!canReadResourceSection(permissions, currentSection)) {
    return redirectToResources({
      currentLocale: getRequestedOrFallbackLocale(request, localeRows),
      localeRows,
      section: permissions.translations.canRead
        ? DASHBOARD_RESOURCES_SECTION.translations
        : DASHBOARD_RESOURCES_SECTION.locales,
      translationLocale: resolveDashboardResourcesTranslationLocale(null, localeRows),
      translationSearch: "",
    });
  }

  const selectedTranslationLocale = canReadTranslations
    ? resolveDashboardResourcesTranslationLocale(
        url.searchParams.get("translationLocale"),
        localeRows,
      )
    : "";
  const editTranslationLocale = canReadTranslations
    ? url.searchParams.get("editTranslationLocale")
    : null;
  const editTranslationKey = canReadTranslations
    ? url.searchParams.get("editTranslationKey")
    : null;
  const translationSearchQuery = canReadTranslations
    ? normalizeDashboardResourcesSearchQuery(url.searchParams.get("translationSearch"))
    : "";
  const requestedTranslationPage = canReadTranslations
    ? normalizeDashboardResourcesPage(url.searchParams.get("translationPage"))
    : 1;
  const translationRecord =
    canReadTranslations && editTranslationLocale && editTranslationKey
      ? await findTranslation(db, editTranslationLocale, editTranslationKey)
      : null;
  const selectedLocaleTranslationCount = canReadTranslations
    ? (localeRows.find((localeRow) => localeRow.code === selectedTranslationLocale)
        ?.translationCount ?? 0)
    : 0;
  const translationsPage =
    canReadTranslations && selectedTranslationLocale
      ? await listTranslationsByLocale(db, selectedTranslationLocale, {
          page: requestedTranslationPage,
          pageSize: DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
          searchQuery: translationSearchQuery,
        })
      : {
          currentPage: 1,
          rows: [],
          totalCount: 0,
        };
  const translationPagination = buildDashboardResourcesTranslationPagination({
    currentPage: translationsPage.currentPage,
    pageSize: DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
    totalItems: translationsPage.totalCount,
  });
  const { localeForm, translationForm } = resolveDashboardResourcesState({
    editLocaleCode: url.searchParams.get("editLocaleCode"),
    editTranslationKey,
    editTranslationLocale,
    localeRows,
    modal: sanitizedModal,
    selectedTranslationLocale,
    translationRecord,
  });

  return {
    access: "granted",
    localeForm,
    locales: localeRows,
    metrics: buildDashboardResourcesMetrics(localeRows, selectedLocaleTranslationCount),
    permissions,
    selectedTranslationLocale,
    translationPagination,
    translationSearchQuery,
    translationForm,
    translations: translationsPage.rows,
  };
}

export async function handleDashboardResourcesAction(
  context: AppLoadContext,
  request: Request,
) {
  const { locale, messages } = await loadI18nPayload(context, request);
  const t = createTranslator(messages);
  const formCopy = buildDashboardResourcesFormCopy(t);
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  const formData = await request.formData();
  const intent = readStringField(formData, RESOURCE_FORM_FIELD.intent);
  const requiredClaim = resolveMutationClaim(
    intent,
    RESOURCE_MUTATION_CLAIMS,
    AUTHORIZATION_CLAIM.resourcesTranslationsDelete,
  );
  const forbidden = denyActionIfMissingClaim(
    auth.actor,
    requiredClaim,
    buildActionErrorState(formCopy.errors.forbidden, 403),
  );

  if (forbidden) {
    return forbidden;
  }

  const beforeLocales = await listLocales(getDbFromContext(context));

  if (isLocaleMutationIntent(intent)) {
    return handleLocaleResourceMutation({
      beforeLocales,
      context,
      currentLocale: locale,
      formCopy,
      formData,
      intent,
      request,
      t,
    });
  }

  if (isTranslationMutationIntent(intent)) {
    return handleTranslationResourceMutation({
      beforeLocales,
      context,
      currentLocale: locale,
      formCopy,
      formData,
      intent,
      request,
      t,
    });
  }

  return buildActionErrorState(formCopy.errors.forbidden, 400);
}
