import { getDbFromContext } from "../../../../../../db/context";
import { RESOURCE_FORM_FIELD } from "~/domain/resources/contract";
import { deleteTranslation } from "~/lib/resources/resources.server";
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
import { redirectToResources } from "../../routing/navigation.server";
import {
  ensureTranslationLocaleRegistry,
  loadLocaleRows,
  type TranslationMutationArgs,
} from "./_shared/support.server";

export async function handleDeleteTranslationMutation(
  args: TranslationMutationArgs<"delete-translation">,
) {
  const action = APP_ERROR_ACTION.delete;
  const db = getDbFromContext(args.context);
  const localeRows = await loadLocaleRows(args.context);

  ensureTranslationLocaleRegistry(action, args.formCopy, localeRows);

  const originalLocale = readStringField(
    args.formData,
    RESOURCE_FORM_FIELD.originalLocale,
  );
  const originalKey = readStringField(args.formData, RESOURCE_FORM_FIELD.originalKey);

  if (!originalLocale || !originalKey) {
    throw buildValidationError({
      action,
      code: APP_ERROR_CODE.resources.translations.delete.missingId,
      message: "Translation delete action missing target identifier",
      resource: APP_ERROR_RESOURCE.resourcesTranslations,
      responseData: buildActionErrorState(
        args.formCopy.errors.deleteTranslationMissing,
        400,
      ),
    });
  }

  const wasDeleted = await deleteTranslation(db, originalLocale, originalKey);

  if (!wasDeleted) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.translations.delete.notFound,
      message: "Translation delete action could not find target record",
      resource: APP_ERROR_RESOURCE.resourcesTranslations,
      responseData: buildActionErrorState(
        args.formCopy.errors.deleteTranslationMissing,
        404,
      ),
      status: 404,
      targetId: `${originalLocale}:${originalKey}`,
      targetLabel: originalKey,
    });
  }

  await purgeI18nDataCache(args.context, args.request, [originalLocale]);
  await recordAuditLog({
    action,
    context: args.context,
    details: {
      intent: args.intent,
    },
    message: "Translation deleted",
    request: args.request,
    resource: APP_ERROR_RESOURCE.resourcesTranslations,
    result: "success",
    statusCode: 302,
    targetId: `${originalLocale}:${originalKey}`,
    targetLabel: originalKey,
  });

  return redirectToResources({
    currentLocale: args.currentLocale,
    localeRows,
    section: "translations",
    translationLocale: originalLocale,
    translationSearch: "",
  });
}
