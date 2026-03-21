import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import {
  buildLocaleFormValues,
  buildTranslationFormValues,
  toResourceBooleanValue,
} from "~/features/resources/resource-form.shared";
import { loadI18nPayload, purgeI18nDataCache } from "~/features/i18n/i18n.server";
import {
  buildLocalizedPath,
  createTranslator,
  getLocaleFromPathname,
} from "~/features/i18n/i18n.shared";
import { buildLoginRedirect } from "~/lib/auth/login.server";
import { requireSession } from "~/lib/auth/session.server";
import { isSessionUserAdmin } from "~/lib/auth/session-user";
import {
  hasParsedLocaleData,
  hasParsedTranslationData,
  parseLocaleFormData,
  parseTranslationFormData,
  type LocaleSubmission,
  type TranslationSubmission,
} from "~/lib/resources/resources-form.server";
import {
  createLocale,
  createTranslation,
  deleteLocale,
  deleteTranslation,
  findTranslation,
  isResourceForeignKeyConstraintError,
  isUniqueLocaleConstraintError,
  isUniqueTranslationConstraintError,
  listLocales,
  listTranslationsByLocale,
  updateLocale,
  updateTranslation,
  type LocaleResourceRecord,
} from "~/lib/resources/resources.server";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/features/resources/resource.shared";

import { buildDashboardResourcesFormCopy } from "./dashboard-resources.constants";
import {
  buildDashboardResourcesHref,
  buildDashboardResourcesMetrics,
  buildDashboardResourcesTranslationPagination,
  DASHBOARD_RESOURCES_TRANSLATIONS_PAGE_SIZE,
  normalizeDashboardResourcesPage,
  normalizeDashboardResourcesSearchQuery,
  resolveDashboardResourcesState,
  resolveDashboardResourcesTab,
  resolveDashboardResourcesTranslationLocale,
  type DashboardResourcesActionState,
  type DashboardResourcesLoaderData,
} from "./dashboard-resources.shared";

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function buildLocaleFormValuesFromSubmission(submission: LocaleSubmission) {
  return buildLocaleFormValues({
    code: submission.code,
    isActive: toResourceBooleanValue(submission.isActive),
    isDefault: toResourceBooleanValue(submission.isDefault),
    label: submission.label,
    sortOrder: submission.sortOrder.toString(),
  });
}

function buildTranslationFormValuesFromSubmission(submission: TranslationSubmission) {
  return buildTranslationFormValues({
    key: submission.key,
    locale: submission.locale,
    value: submission.value,
  });
}

function toActiveLocaleCodes(localeRows: readonly LocaleResourceRecord[]) {
  return localeRows
    .filter((localeRow) => localeRow.isActive)
    .map((localeRow) => localeRow.code);
}

function pickRedirectLocale(
  currentLocale: string,
  localeRows: readonly LocaleResourceRecord[],
) {
  const activeLocales = localeRows.filter((localeRow) => localeRow.isActive);

  return (
    activeLocales.find((localeRow) => localeRow.code === currentLocale)?.code ??
    activeLocales.find((localeRow) => localeRow.isDefault)?.code ??
    activeLocales[0]?.code ??
    currentLocale
  );
}

function pickNextDefaultLocaleCode(
  localeRows: readonly LocaleResourceRecord[],
  excludedCode: string,
) {
  return (
    localeRows.find(
      (localeRow) => localeRow.code !== excludedCode && localeRow.isActive,
    )?.code ?? null
  );
}

function buildLocaleCodeUnion(...collections: readonly string[][]) {
  return Array.from(new Set(collections.flat().filter(Boolean)));
}

function getRequestedLocaleFromPathname(request: Request) {
  return getLocaleFromPathname(new URL(request.url).pathname);
}

function buildActionErrorState(message: string, status = 400) {
  return data<DashboardResourcesActionState>(
    {
      actionError: message,
    },
    { status },
  );
}

function buildLocaleFormStateResponse(args: {
  editingCode?: string | null;
  errors: NonNullable<DashboardResourcesActionState["localeForm"]>["errors"];
  mode: "create" | "edit";
  status: number;
  values: NonNullable<DashboardResourcesActionState["localeForm"]>["values"];
}) {
  return data<DashboardResourcesActionState>(
    {
      localeForm: {
        editingCode: args.editingCode ?? null,
        errors: args.errors,
        isOpen: true,
        mode: args.mode,
        values: args.values,
      },
    },
    { status: args.status },
  );
}

function buildTranslationFormStateResponse(args: {
  editingKey?: string | null;
  editingLocale?: string | null;
  errors: NonNullable<DashboardResourcesActionState["translationForm"]>["errors"];
  mode: "create" | "edit";
  status: number;
  values: NonNullable<DashboardResourcesActionState["translationForm"]>["values"];
}) {
  return data<DashboardResourcesActionState>(
    {
      translationForm: {
        editingKey: args.editingKey ?? null,
        editingLocale: args.editingLocale ?? null,
        errors: args.errors,
        isOpen: true,
        mode: args.mode,
        values: args.values,
      },
    },
    { status: args.status },
  );
}

function redirectToResources(args: {
  currentLocale: string;
  localeRows: readonly LocaleResourceRecord[];
  preferredLocale?: string;
  tab: "locales" | "translations";
  translationLocale?: string;
  translationSearch?: string;
}) {
  const redirectLocale = pickRedirectLocale(
    args.preferredLocale ?? args.currentLocale,
    args.localeRows,
  );
  const supportedLocaleCodes = toActiveLocaleCodes(args.localeRows);

  return redirect(
    buildLocalizedPath(
      redirectLocale,
      buildDashboardResourcesHref({
        tab: args.tab,
        translationLocale: args.translationLocale,
        translationSearch: args.translationSearch,
      }),
      supportedLocaleCodes,
    ),
  );
}

export async function loadDashboardResourcesData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardResourcesLoaderData | Response> {
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });

  if (session instanceof Response) {
    return session;
  }

  if (!isSessionUserAdmin(session)) {
    return {
      access: "denied",
    };
  }

  const db = getDbFromContext(context);
  const localeRows = await listLocales(db);
  const url = new URL(request.url);
  const activeTab = resolveDashboardResourcesTab(url.searchParams.get("tab"));
  const selectedTranslationLocale = resolveDashboardResourcesTranslationLocale(
    url.searchParams.get("translationLocale"),
    localeRows,
  );
  const editTranslationLocale = url.searchParams.get("editTranslationLocale");
  const editTranslationKey = url.searchParams.get("editTranslationKey");
  const translationSearchQuery = normalizeDashboardResourcesSearchQuery(
    url.searchParams.get("translationSearch"),
  );
  const requestedTranslationPage = normalizeDashboardResourcesPage(
    url.searchParams.get("translationPage"),
  );
  const translationRecord =
    editTranslationLocale && editTranslationKey
      ? await findTranslation(db, editTranslationLocale, editTranslationKey)
      : null;
  const selectedLocaleTranslationCount =
    localeRows.find((localeRow) => localeRow.code === selectedTranslationLocale)
      ?.translationCount ?? 0;
  const translationsPage = selectedTranslationLocale
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
    modal: url.searchParams.get("modal"),
    selectedTranslationLocale,
    translationRecord,
  });

  return {
    access: "granted",
    activeTab,
    localeForm,
    locales: localeRows,
    metrics: buildDashboardResourcesMetrics(localeRows, selectedLocaleTranslationCount),
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
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });

  if (session instanceof Response) {
    return session;
  }

  if (!isSessionUserAdmin(session)) {
    return buildActionErrorState(formCopy.errors.forbidden, 403);
  }

  const db = getDbFromContext(context);
  const formData = await request.formData();
  const intent = readStringField(formData, RESOURCE_FORM_FIELD.intent);
  const beforeLocales = await listLocales(db);
  const localeCodesBefore = beforeLocales.map((localeRow) => localeRow.code);

  if (intent === RESOURCE_MUTATION_INTENT.deleteLocale) {
    const originalCode = readStringField(formData, RESOURCE_FORM_FIELD.originalCode);

    if (!originalCode) {
      return buildActionErrorState(formCopy.errors.deleteLocaleMissing, 400);
    }

    const localeToDelete = beforeLocales.find(
      (localeRow) => localeRow.code === originalCode,
    );

    if (!localeToDelete) {
      return buildActionErrorState(formCopy.errors.localeMissing, 404);
    }

    const activeLocaleCount = beforeLocales.filter(
      (localeRow) => localeRow.isActive,
    ).length;

    if (localeToDelete.isActive && activeLocaleCount === 1) {
      return buildActionErrorState(formCopy.errors.deleteLocaleRestricted, 409);
    }

    const promotedDefaultCode = localeToDelete.isDefault
      ? pickNextDefaultLocaleCode(beforeLocales, localeToDelete.code)
      : null;

    if (localeToDelete.isDefault && !promotedDefaultCode) {
      return buildActionErrorState(formCopy.errors.deleteLocaleRestricted, 409);
    }

    await deleteLocale(db, originalCode, {
      promotedDefaultCode: promotedDefaultCode ?? undefined,
    });

    const afterLocales = await listLocales(db);

    await purgeI18nDataCache(
      context,
      request,
      buildLocaleCodeUnion(
        localeCodesBefore,
        afterLocales.map((localeRow) => localeRow.code),
      ),
    );

    return redirectToResources({
      currentLocale: locale,
      localeRows: afterLocales,
      tab: "locales",
      translationSearch: "",
    });
  }

  if (intent === RESOURCE_MUTATION_INTENT.createLocale) {
    const submission = parseLocaleFormData(formData, t);

    if (!hasParsedLocaleData(submission)) {
      return buildLocaleFormStateResponse({
        errors: submission.errors,
        mode: "create",
        status: 400,
        values: submission.values,
      });
    }

    try {
      await createLocale(db, submission.data);
    } catch (error) {
      if (isUniqueLocaleConstraintError(error)) {
        return buildLocaleFormStateResponse({
          errors: {
            code: formCopy.errors.createLocaleDuplicateCode,
          },
          mode: "create",
          status: 409,
          values: buildLocaleFormValuesFromSubmission(submission.data),
        });
      }

      throw error;
    }

    const afterLocales = await listLocales(db);

    await purgeI18nDataCache(
      context,
      request,
      buildLocaleCodeUnion(
        localeCodesBefore,
        afterLocales.map((localeRow) => localeRow.code),
        [submission.data.code],
      ),
    );

    return redirectToResources({
      currentLocale: locale,
      localeRows: afterLocales,
      tab: "locales",
      translationSearch: "",
    });
  }

  if (intent === RESOURCE_MUTATION_INTENT.updateLocale) {
    const originalCode = readStringField(formData, RESOURCE_FORM_FIELD.originalCode);
    const requestedLocale = getRequestedLocaleFromPathname(request);
    const submission = parseLocaleFormData(formData, t);

    if (!hasParsedLocaleData(submission)) {
      return buildLocaleFormStateResponse({
        editingCode: originalCode,
        errors: submission.errors,
        mode: "edit",
        status: 400,
        values: submission.values,
      });
    }

    if (!originalCode) {
      return buildLocaleFormStateResponse({
        errors: {
          form: formCopy.errors.updateLocaleMissing,
        },
        editingCode: null,
        mode: "edit",
        status: 400,
        values: buildLocaleFormValuesFromSubmission(submission.data),
      });
    }

    const localeToUpdate = beforeLocales.find(
      (localeRow) => localeRow.code === originalCode,
    );

    if (!localeToUpdate) {
      return buildLocaleFormStateResponse({
        errors: {
          form: formCopy.errors.localeMissing,
        },
        editingCode: originalCode,
        mode: "edit",
        status: 404,
        values: buildLocaleFormValuesFromSubmission(submission.data),
      });
    }

    const activeLocaleCount = beforeLocales.filter(
      (localeRow) => localeRow.isActive,
    ).length;

    if (
      localeToUpdate.isActive &&
      !submission.data.isActive &&
      activeLocaleCount === 1
    ) {
      return buildLocaleFormStateResponse({
        errors: {
          form: formCopy.errors.deleteLocaleRestricted,
        },
        editingCode: originalCode,
        mode: "edit",
        status: 409,
        values: buildLocaleFormValuesFromSubmission(submission.data),
      });
    }

    const promotedDefaultCode =
      localeToUpdate.isDefault && !submission.data.isDefault
        ? pickNextDefaultLocaleCode(beforeLocales, localeToUpdate.code)
        : null;

    if (
      localeToUpdate.isDefault &&
      !submission.data.isDefault &&
      !promotedDefaultCode
    ) {
      return buildLocaleFormStateResponse({
        errors: {
          form: formCopy.errors.deleteLocaleRestricted,
        },
        editingCode: originalCode,
        mode: "edit",
        status: 409,
        values: buildLocaleFormValuesFromSubmission(submission.data),
      });
    }

    try {
      await updateLocale(db, originalCode, submission.data, {
        promotedDefaultCode: promotedDefaultCode ?? undefined,
      });
    } catch (error) {
      if (isUniqueLocaleConstraintError(error)) {
        return buildLocaleFormStateResponse({
          errors: {
            code: formCopy.errors.updateLocaleDuplicateCode,
          },
          editingCode: originalCode,
          mode: "edit",
          status: 409,
          values: buildLocaleFormValuesFromSubmission(submission.data),
        });
      }

      throw error;
    }

    const afterLocales = await listLocales(db);

    await purgeI18nDataCache(
      context,
      request,
      buildLocaleCodeUnion(
        localeCodesBefore,
        afterLocales.map((localeRow) => localeRow.code),
        [originalCode, submission.data.code],
      ),
    );

    return redirectToResources({
      currentLocale: locale,
      localeRows: afterLocales,
      preferredLocale:
        requestedLocale === originalCode
          ? submission.data.code
          : (requestedLocale ?? locale),
      tab: "locales",
      translationSearch: "",
    });
  }

  const allLocaleCodes = beforeLocales.map((localeRow) => localeRow.code);

  if (allLocaleCodes.length === 0) {
    return buildActionErrorState(formCopy.errors.translationLocaleMissing, 409);
  }

  if (intent === RESOURCE_MUTATION_INTENT.deleteTranslation) {
    const originalLocale = readStringField(
      formData,
      RESOURCE_FORM_FIELD.originalLocale,
    );
    const originalKey = readStringField(formData, RESOURCE_FORM_FIELD.originalKey);

    if (!originalLocale || !originalKey) {
      return buildActionErrorState(formCopy.errors.deleteTranslationMissing, 400);
    }

    const wasDeleted = await deleteTranslation(db, originalLocale, originalKey);

    if (!wasDeleted) {
      return buildActionErrorState(formCopy.errors.deleteTranslationMissing, 404);
    }

    await purgeI18nDataCache(context, request, [originalLocale]);

    return redirectToResources({
      currentLocale: locale,
      localeRows: beforeLocales,
      tab: "translations",
      translationLocale: originalLocale,
      translationSearch: "",
    });
  }

  if (intent === RESOURCE_MUTATION_INTENT.createTranslation) {
    const submission = parseTranslationFormData(formData, allLocaleCodes, t);

    if (!hasParsedTranslationData(submission)) {
      return buildTranslationFormStateResponse({
        errors: submission.errors,
        mode: "create",
        status: 400,
        values: submission.values,
      });
    }

    try {
      await createTranslation(db, submission.data);
    } catch (error) {
      if (isUniqueTranslationConstraintError(error)) {
        return buildTranslationFormStateResponse({
          errors: {
            key: formCopy.errors.createTranslationDuplicateKey,
          },
          mode: "create",
          status: 409,
          values: buildTranslationFormValuesFromSubmission(submission.data),
        });
      }

      if (isResourceForeignKeyConstraintError(error)) {
        return buildTranslationFormStateResponse({
          errors: {
            locale: formCopy.errors.translationLocaleMissing,
          },
          mode: "create",
          status: 409,
          values: buildTranslationFormValuesFromSubmission(submission.data),
        });
      }

      throw error;
    }

    await purgeI18nDataCache(context, request, [submission.data.locale]);

    return redirectToResources({
      currentLocale: locale,
      localeRows: beforeLocales,
      tab: "translations",
      translationLocale: submission.data.locale,
      translationSearch: "",
    });
  }

  if (intent === RESOURCE_MUTATION_INTENT.updateTranslation) {
    const originalLocale = readStringField(
      formData,
      RESOURCE_FORM_FIELD.originalLocale,
    );
    const originalKey = readStringField(formData, RESOURCE_FORM_FIELD.originalKey);
    const submission = parseTranslationFormData(formData, allLocaleCodes, t);

    if (!hasParsedTranslationData(submission)) {
      return buildTranslationFormStateResponse({
        editingKey: originalKey,
        editingLocale: originalLocale,
        errors: submission.errors,
        mode: "edit",
        status: 400,
        values: submission.values,
      });
    }

    if (!originalLocale || !originalKey) {
      return buildTranslationFormStateResponse({
        errors: {
          form: formCopy.errors.updateTranslationMissing,
        },
        mode: "edit",
        status: 400,
        values: buildTranslationFormValuesFromSubmission(submission.data),
      });
    }

    try {
      const wasUpdated = await updateTranslation(
        db,
        originalLocale,
        originalKey,
        submission.data,
      );

      if (!wasUpdated) {
        return buildTranslationFormStateResponse({
          editingKey: originalKey,
          editingLocale: originalLocale,
          errors: {
            form: formCopy.errors.updateTranslationMissing,
          },
          mode: "edit",
          status: 404,
          values: buildTranslationFormValuesFromSubmission(submission.data),
        });
      }
    } catch (error) {
      if (isUniqueTranslationConstraintError(error)) {
        return buildTranslationFormStateResponse({
          editingKey: originalKey,
          editingLocale: originalLocale,
          errors: {
            key: formCopy.errors.updateTranslationDuplicateKey,
          },
          mode: "edit",
          status: 409,
          values: buildTranslationFormValuesFromSubmission(submission.data),
        });
      }

      if (isResourceForeignKeyConstraintError(error)) {
        return buildTranslationFormStateResponse({
          editingKey: originalKey,
          editingLocale: originalLocale,
          errors: {
            locale: formCopy.errors.translationLocaleMissing,
          },
          mode: "edit",
          status: 409,
          values: buildTranslationFormValuesFromSubmission(submission.data),
        });
      }

      throw error;
    }

    await purgeI18nDataCache(context, request, [
      originalLocale,
      submission.data.locale,
    ]);

    return redirectToResources({
      currentLocale: locale,
      localeRows: beforeLocales,
      tab: "translations",
      translationLocale: submission.data.locale,
      translationSearch: "",
    });
  }

  return buildActionErrorState(formCopy.errors.forbidden, 400);
}
