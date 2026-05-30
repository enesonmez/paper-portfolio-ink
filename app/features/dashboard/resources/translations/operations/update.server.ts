import { getDbFromContext } from "../../../../../../db/context";
import { RESOURCE_FORM_FIELD } from "~/domain/resources/contract";
import {
  isResourceForeignKeyConstraintError,
  isUniqueTranslationConstraintError,
  updateTranslation,
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
  buildTranslationFormStateResponse,
  buildTranslationFormValuesFromSubmission,
} from "../../forms/form-state.server";
import { redirectToResources } from "../../routing/navigation.server";
import {
  buildTranslationConflictState,
  ensureTranslationLocaleRegistry,
  loadLocaleRows,
  parseTranslationSubmission,
  type TranslationMutationArgs,
} from "./_shared/support.server";
import { DASHBOARD_RESOURCES_FORM_MODE } from "../../state";

export async function handleUpdateTranslationMutation(
  args: TranslationMutationArgs<"update-translation">,
) {
  const action = APP_ERROR_ACTION.update;
  const db = getDbFromContext(args.context);
  const localeRows = await loadLocaleRows(args.context);
  const localeCodes = ensureTranslationLocaleRegistry(
    action,
    args.formCopy,
    localeRows,
  );
  const originalLocale = readStringField(
    args.formData,
    RESOURCE_FORM_FIELD.originalLocale,
  );
  const originalKey = readStringField(args.formData, RESOURCE_FORM_FIELD.originalKey);
  const submission = parseTranslationSubmission(
    action,
    args.formData,
    localeCodes,
    args.t,
  );

  if (!originalLocale || !originalKey) {
    throw buildValidationError({
      action,
      code: APP_ERROR_CODE.resources.translations.update.missingId,
      message: "Translation update action missing target identifier",
      resource: APP_ERROR_RESOURCE.resourcesTranslations,
      responseData: buildTranslationFormStateResponse({
        errors: {
          form: args.formCopy.errors.updateTranslationMissing,
        },
        mode: DASHBOARD_RESOURCES_FORM_MODE.edit,
        status: 400,
        values: buildTranslationFormValuesFromSubmission(submission),
      }),
    });
  }

  try {
    const wasUpdated = await updateTranslation(
      db,
      originalLocale,
      originalKey,
      submission,
    );

    if (!wasUpdated) {
      throw buildBusinessError({
        action,
        code: APP_ERROR_CODE.resources.translations.update.notFound,
        message: "Translation update action could not find target record",
        resource: APP_ERROR_RESOURCE.resourcesTranslations,
        responseData: buildTranslationFormStateResponse({
          editingKey: originalKey,
          editingLocale: originalLocale,
          errors: {
            form: args.formCopy.errors.updateTranslationMissing,
          },
          mode: DASHBOARD_RESOURCES_FORM_MODE.edit,
          status: 404,
          values: buildTranslationFormValuesFromSubmission(submission),
        }),
        status: 404,
        targetId: `${originalLocale}:${originalKey}`,
        targetLabel: originalKey,
      });
    }
  } catch (error) {
    if (isUniqueTranslationConstraintError(error)) {
      throw buildConflictError({
        action,
        code: APP_ERROR_CODE.resources.translations.update.duplicateKey,
        details: {
          key: submission.key,
          locale: submission.locale,
          originalKey,
          originalLocale,
        },
        message: "Translation update rejected because key already exists for locale",
        resource: APP_ERROR_RESOURCE.resourcesTranslations,
        responseData: buildTranslationConflictState(
          "key",
          args.formCopy.errors.updateTranslationDuplicateKey,
          DASHBOARD_RESOURCES_FORM_MODE.edit,
          submission,
          originalKey,
          originalLocale,
        ),
        status: 409,
        targetId: `${originalLocale}:${originalKey}`,
        targetLabel: submission.key,
      });
    }

    if (isResourceForeignKeyConstraintError(error)) {
      throw buildConflictError({
        action,
        code: APP_ERROR_CODE.resources.translations.update.missingLocale,
        details: {
          key: submission.key,
          locale: submission.locale,
          originalKey,
          originalLocale,
        },
        message: "Translation update rejected because locale no longer exists",
        resource: APP_ERROR_RESOURCE.resourcesTranslations,
        responseData: buildTranslationConflictState(
          "locale",
          args.formCopy.errors.translationLocaleMissing,
          DASHBOARD_RESOURCES_FORM_MODE.edit,
          submission,
          originalKey,
          originalLocale,
        ),
        status: 409,
        targetId: `${originalLocale}:${originalKey}`,
        targetLabel: submission.key,
      });
    }

    throw error;
  }

  await purgeI18nDataCache(args.context, args.request, [
    originalLocale,
    submission.locale,
  ]);
  await recordAuditLog({
    action,
    context: args.context,
    details: {
      intent: args.intent,
      key: submission.key,
      locale: submission.locale,
      originalKey,
      originalLocale,
    },
    message: "Translation updated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.resourcesTranslations,
    result: "success",
    statusCode: 302,
    targetId: `${originalLocale}:${originalKey}`,
    targetLabel: submission.key,
  });

  return redirectToResources({
    currentLocale: args.currentLocale,
    localeRows,
    section: "translations",
    translationLocale: submission.locale,
    translationSearch: "",
  });
}
