import { getDbFromContext } from "../../../../../../db/context";
import { RESOURCE_FORM_FIELD } from "~/domain/resources/contract";
import { deleteLocale } from "~/lib/resources/resources.server";
import {
  buildBusinessError,
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

import { buildActionErrorState } from "../../forms/form-state.server";
import {
  buildLocaleCodeUnion,
  pickNextDefaultLocaleCode,
  redirectToResources,
} from "../../routing/navigation.server";
import {
  getLocaleCodes,
  loadLocaleRows,
  type LocaleMutationArgs,
} from "./_shared/support.server";

export async function handleDeleteLocaleMutation(
  args: LocaleMutationArgs<"delete-locale">,
) {
  const action = APP_ERROR_ACTION.delete;
  const db = getDbFromContext(args.context);
  const beforeLocales = await loadLocaleRows(args.context);
  const localeCodesBefore = getLocaleCodes(beforeLocales);
  const originalCode = readStringField(args.formData, RESOURCE_FORM_FIELD.originalCode);

  if (!originalCode) {
    throw buildValidationError({
      action,
      code: APP_ERROR_CODE.resources.locales.delete.missingId,
      message: "Locale delete action missing target identifier",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildActionErrorState(
        args.formCopy.errors.deleteLocaleMissing,
        400,
      ),
    });
  }

  const localeToDelete = beforeLocales.find(
    (localeRow) => localeRow.code === originalCode,
  );

  if (!localeToDelete) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.delete.notFound,
      message: "Locale delete action could not find target locale",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildActionErrorState(args.formCopy.errors.localeMissing, 404),
      status: 404,
      targetId: originalCode,
    });
  }

  const activeLocaleCount = beforeLocales.filter(
    (localeRow) => localeRow.isActive,
  ).length;

  if (localeToDelete.isActive && activeLocaleCount === 1) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.delete.lastActiveGuard,
      message: "Locale delete rejected because it would remove the last active locale",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildActionErrorState(
        args.formCopy.errors.deleteLocaleRestricted,
        409,
      ),
      status: 409,
      targetId: originalCode,
      targetLabel: localeToDelete.label,
    });
  }

  const promotedDefaultCode = localeToDelete.isDefault
    ? pickNextDefaultLocaleCode(beforeLocales, localeToDelete.code)
    : null;

  if (localeToDelete.isDefault && !promotedDefaultCode) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.delete.defaultGuard,
      message: "Locale delete rejected because no default fallback locale exists",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildActionErrorState(
        args.formCopy.errors.deleteLocaleRestricted,
        409,
      ),
      status: 409,
      targetId: originalCode,
      targetLabel: localeToDelete.label,
    });
  }

  await deleteLocale(db, originalCode, {
    promotedDefaultCode: promotedDefaultCode ?? undefined,
  });

  const afterLocales = await loadLocaleRows(args.context);

  await purgeI18nDataCache(
    args.context,
    args.request,
    buildLocaleCodeUnion(localeCodesBefore, getLocaleCodes(afterLocales)),
  );
  await recordAuditLog({
    action,
    context: args.context,
    details: {
      intent: args.intent,
      promotedDefaultCode,
    },
    message: "Locale deleted",
    request: args.request,
    resource: APP_ERROR_RESOURCE.resourcesLocales,
    result: "success",
    statusCode: 302,
    targetId: originalCode,
    targetLabel: localeToDelete.label,
  });

  return redirectToResources({
    currentLocale: args.currentLocale,
    localeRows: afterLocales,
    section: "locales",
    translationSearch: "",
  });
}
