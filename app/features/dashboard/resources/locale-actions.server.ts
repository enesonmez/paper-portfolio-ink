import type { AppLoadContext } from "react-router";

import {
  hasParsedLocaleData,
  parseLocaleFormData,
} from "~/lib/resources/resources-form.server";
import {
  createLocale,
  deleteLocale,
  isUniqueLocaleConstraintError,
  listLocales,
  updateLocale,
  type LocaleResourceRecord,
} from "~/lib/resources/resources.server";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/domain/resources/contract";
import { purgeI18nDataCache } from "~/shared/i18n/i18n.server";
import { readStringField } from "~/shared/forms/form-data.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

import type { DashboardResourcesFormCopy } from "./copy";
import {
  buildActionErrorState,
  buildLocaleFormStateResponse,
  buildLocaleFormValuesFromSubmission,
} from "./action-state.server";
import {
  buildLocaleCodeUnion,
  getRequestedLocaleFromPathname,
  pickNextDefaultLocaleCode,
  redirectToResources,
} from "./navigation.server";

interface HandleLocaleResourceMutationArgs {
  beforeLocales: readonly LocaleResourceRecord[];
  context: AppLoadContext;
  currentLocale: string;
  formCopy: DashboardResourcesFormCopy;
  formData: FormData;
  intent: string;
  request: Request;
  t: I18nTranslator;
}

export async function handleLocaleResourceMutation(
  args: HandleLocaleResourceMutationArgs,
) {
  const db = args.context.db;
  const localeCodesBefore = args.beforeLocales.map((localeRow) => localeRow.code);

  if (args.intent === RESOURCE_MUTATION_INTENT.deleteLocale) {
    const originalCode = readStringField(
      args.formData,
      RESOURCE_FORM_FIELD.originalCode,
    );

    if (!originalCode) {
      return buildActionErrorState(args.formCopy.errors.deleteLocaleMissing, 400);
    }

    const localeToDelete = args.beforeLocales.find(
      (localeRow) => localeRow.code === originalCode,
    );

    if (!localeToDelete) {
      return buildActionErrorState(args.formCopy.errors.localeMissing, 404);
    }

    const activeLocaleCount = args.beforeLocales.filter(
      (localeRow) => localeRow.isActive,
    ).length;

    if (localeToDelete.isActive && activeLocaleCount === 1) {
      return buildActionErrorState(args.formCopy.errors.deleteLocaleRestricted, 409);
    }

    const promotedDefaultCode = localeToDelete.isDefault
      ? pickNextDefaultLocaleCode(args.beforeLocales, localeToDelete.code)
      : null;

    if (localeToDelete.isDefault && !promotedDefaultCode) {
      return buildActionErrorState(args.formCopy.errors.deleteLocaleRestricted, 409);
    }

    await deleteLocale(db, originalCode, {
      promotedDefaultCode: promotedDefaultCode ?? undefined,
    });

    const afterLocales = await listLocales(db);

    await purgeI18nDataCache(
      args.context,
      args.request,
      buildLocaleCodeUnion(
        localeCodesBefore,
        afterLocales.map((localeRow) => localeRow.code),
      ),
    );

    return redirectToResources({
      currentLocale: args.currentLocale,
      localeRows: afterLocales,
      section: "locales",
      translationSearch: "",
    });
  }

  if (args.intent === RESOURCE_MUTATION_INTENT.createLocale) {
    const submission = parseLocaleFormData(args.formData, args.t);

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
            code: args.formCopy.errors.createLocaleDuplicateCode,
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
      args.context,
      args.request,
      buildLocaleCodeUnion(
        localeCodesBefore,
        afterLocales.map((localeRow) => localeRow.code),
        [submission.data.code],
      ),
    );

    return redirectToResources({
      currentLocale: args.currentLocale,
      localeRows: afterLocales,
      section: "locales",
      translationSearch: "",
    });
  }

  const originalCode = readStringField(args.formData, RESOURCE_FORM_FIELD.originalCode);
  const requestedLocale = getRequestedLocaleFromPathname(args.request);
  const submission = parseLocaleFormData(args.formData, args.t);

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
        form: args.formCopy.errors.updateLocaleMissing,
      },
      editingCode: null,
      mode: "edit",
      status: 400,
      values: buildLocaleFormValuesFromSubmission(submission.data),
    });
  }

  const localeToUpdate = args.beforeLocales.find(
    (localeRow) => localeRow.code === originalCode,
  );

  if (!localeToUpdate) {
    return buildLocaleFormStateResponse({
      errors: {
        form: args.formCopy.errors.localeMissing,
      },
      editingCode: originalCode,
      mode: "edit",
      status: 404,
      values: buildLocaleFormValuesFromSubmission(submission.data),
    });
  }

  const activeLocaleCount = args.beforeLocales.filter(
    (localeRow) => localeRow.isActive,
  ).length;

  if (localeToUpdate.isActive && !submission.data.isActive && activeLocaleCount === 1) {
    return buildLocaleFormStateResponse({
      errors: {
        form: args.formCopy.errors.deleteLocaleRestricted,
      },
      editingCode: originalCode,
      mode: "edit",
      status: 409,
      values: buildLocaleFormValuesFromSubmission(submission.data),
    });
  }

  const promotedDefaultCode =
    localeToUpdate.isDefault && !submission.data.isDefault
      ? pickNextDefaultLocaleCode(args.beforeLocales, localeToUpdate.code)
      : null;

  if (localeToUpdate.isDefault && !submission.data.isDefault && !promotedDefaultCode) {
    return buildLocaleFormStateResponse({
      errors: {
        form: args.formCopy.errors.deleteLocaleRestricted,
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
          code: args.formCopy.errors.updateLocaleDuplicateCode,
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
    args.context,
    args.request,
    buildLocaleCodeUnion(
      localeCodesBefore,
      afterLocales.map((localeRow) => localeRow.code),
      [originalCode, submission.data.code],
    ),
  );

  return redirectToResources({
    currentLocale: args.currentLocale,
    localeRows: afterLocales,
    preferredLocale:
      requestedLocale === originalCode
        ? submission.data.code
        : (requestedLocale ?? args.currentLocale),
    section: "locales",
    translationSearch: "",
  });
}
