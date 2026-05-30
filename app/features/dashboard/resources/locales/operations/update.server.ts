import { getDbFromContext } from "../../../../../../db/context";
import { RESOURCE_FORM_FIELD } from "~/domain/resources/contract";
import {
  isUniqueLocaleConstraintError,
  updateLocale,
} from "~/lib/resources/resources.server";
import {
  buildBusinessError,
  buildConflictError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { readStringField } from "~/shared/forms/form-data.server";
import { purgeI18nDataCache } from "~/shared/i18n/i18n.server";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  buildLocaleFormStateResponse,
  buildLocaleFormValuesFromSubmission,
} from "../../forms/form-state.server";
import {
  buildLocaleCodeUnion,
  getRequestedLocaleFromPathname,
  getRequestedOrFallbackLocale,
  pickNextDefaultLocaleCode,
  redirectToResources,
} from "../../routing/navigation.server";
import {
  buildLocaleConflictState,
  getLocaleCodes,
  loadLocaleRows,
  parseLocaleSubmission,
  type LocaleMutationArgs,
} from "./_shared/support.server";
import { DASHBOARD_RESOURCES_FORM_MODE } from "../../state";

export async function handleUpdateLocaleMutation(
  args: LocaleMutationArgs<"update-locale">,
) {
  const action = APP_ERROR_ACTION.update;
  const db = getDbFromContext(args.context);
  const beforeLocales = await loadLocaleRows(args.context);
  const localeCodesBefore = getLocaleCodes(beforeLocales);
  const originalCode = readStringField(args.formData, RESOURCE_FORM_FIELD.originalCode);
  const requestedLocale = getRequestedLocaleFromPathname(args.request);
  const submission = parseLocaleSubmission(args.formData, args.t, action);

  if (!originalCode) {
    throw buildValidationError({
      action,
      code: APP_ERROR_CODE.resources.locales.update.missingId,
      message: "Locale update action missing target identifier",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildLocaleFormStateResponse({
        errors: {
          form: args.formCopy.errors.updateLocaleMissing,
        },
        editingCode: null,
        mode: DASHBOARD_RESOURCES_FORM_MODE.edit,
        status: 400,
        values: buildLocaleFormValuesFromSubmission(submission),
      }),
    });
  }

  const localeToUpdate = beforeLocales.find(
    (localeRow) => localeRow.code === originalCode,
  );

  if (!localeToUpdate) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.update.notFound,
      message: "Locale update action could not find target locale",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildLocaleFormStateResponse({
        errors: {
          form: args.formCopy.errors.localeMissing,
        },
        editingCode: originalCode,
        mode: DASHBOARD_RESOURCES_FORM_MODE.edit,
        status: 404,
        values: buildLocaleFormValuesFromSubmission(submission),
      }),
      status: 404,
      targetId: originalCode,
    });
  }

  const activeLocaleCount = beforeLocales.filter(
    (localeRow) => localeRow.isActive,
  ).length;

  if (localeToUpdate.isActive && !submission.isActive && activeLocaleCount === 1) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.update.lastActiveGuard,
      message:
        "Locale update rejected because it would deactivate the last active locale",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildLocaleFormStateResponse({
        errors: {
          form: args.formCopy.errors.deleteLocaleRestricted,
        },
        editingCode: originalCode,
        mode: DASHBOARD_RESOURCES_FORM_MODE.edit,
        status: 409,
        values: buildLocaleFormValuesFromSubmission(submission),
      }),
      status: 409,
      targetId: originalCode,
      targetLabel: submission.label,
    });
  }

  const promotedDefaultCode =
    localeToUpdate.isDefault && !submission.isDefault
      ? pickNextDefaultLocaleCode(beforeLocales, localeToUpdate.code)
      : null;

  if (localeToUpdate.isDefault && !submission.isDefault && !promotedDefaultCode) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.update.defaultGuard,
      message: "Locale update rejected because no default fallback locale exists",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildLocaleFormStateResponse({
        errors: {
          form: args.formCopy.errors.deleteLocaleRestricted,
        },
        editingCode: originalCode,
        mode: DASHBOARD_RESOURCES_FORM_MODE.edit,
        status: 409,
        values: buildLocaleFormValuesFromSubmission(submission),
      }),
      status: 409,
      targetId: originalCode,
      targetLabel: submission.label,
    });
  }

  try {
    await updateLocale(db, originalCode, submission, {
      promotedDefaultCode: promotedDefaultCode ?? undefined,
    });
  } catch (error) {
    if (isUniqueLocaleConstraintError(error)) {
      throw buildConflictError({
        action,
        code: APP_ERROR_CODE.resources.locales.update.duplicateCode,
        details: {
          code: submission.code,
          originalCode,
        },
        message: "Locale update rejected because code is already taken",
        resource: APP_ERROR_RESOURCE.resourcesLocales,
        responseData: buildLocaleConflictState(
          args.formCopy.errors.updateLocaleDuplicateCode,
          DASHBOARD_RESOURCES_FORM_MODE.edit,
          submission,
          originalCode,
        ),
        status: 409,
        targetId: originalCode,
        targetLabel: submission.label,
      });
    }

    throw error;
  }

  const afterLocales = await loadLocaleRows(args.context);

  await purgeI18nDataCache(
    args.context,
    args.request,
    buildLocaleCodeUnion(localeCodesBefore, getLocaleCodes(afterLocales), [
      originalCode,
      submission.code,
    ]),
  );
  await recordAuditLog({
    action,
    context: args.context,
    details: {
      code: submission.code,
      intent: args.intent,
      originalCode,
      promotedDefaultCode,
    },
    message: "Locale updated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.resourcesLocales,
    result: "success",
    statusCode: 302,
    targetId: originalCode,
    targetLabel: submission.label,
  });

  return redirectToResources({
    currentLocale: args.currentLocale,
    localeRows: afterLocales,
    preferredLocale:
      requestedLocale === originalCode
        ? submission.code
        : (requestedLocale ?? getRequestedOrFallbackLocale(args.request, afterLocales)),
    section: "locales",
    translationSearch: "",
  });
}
