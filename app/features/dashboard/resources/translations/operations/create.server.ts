import { getDbFromContext } from "../../../../../../db/context";
import {
  createTranslation,
  isResourceForeignKeyConstraintError,
  isUniqueTranslationConstraintError,
} from "~/lib/resources/resources.server";
import { buildConflictError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { purgeI18nDataCache } from "~/shared/i18n/i18n.server";
import { recordAuditLog } from "~/shared/logging/audit.server";

import { redirectToResources } from "../../routing/navigation.server";
import {
  buildTranslationConflictState,
  ensureTranslationLocaleRegistry,
  loadLocaleRows,
  parseTranslationSubmission,
  type TranslationMutationArgs,
} from "./_shared/support.server";

export async function handleCreateTranslationMutation(
  args: TranslationMutationArgs<"create-translation">,
) {
  const action = APP_ERROR_ACTION.create;
  const db = getDbFromContext(args.context);
  const localeRows = await loadLocaleRows(args.context);
  const localeCodes = ensureTranslationLocaleRegistry(
    action,
    args.formCopy,
    localeRows,
  );
  const submission = parseTranslationSubmission(
    action,
    args.formData,
    localeCodes,
    args.t,
  );

  try {
    await createTranslation(db, submission);
  } catch (error) {
    if (isUniqueTranslationConstraintError(error)) {
      throw buildConflictError({
        action,
        code: APP_ERROR_CODE.resources.translations.create.duplicateKey,
        details: {
          key: submission.key,
          locale: submission.locale,
        },
        message: "Translation creation rejected because key already exists for locale",
        resource: APP_ERROR_RESOURCE.resourcesTranslations,
        responseData: buildTranslationConflictState(
          "key",
          args.formCopy.errors.createTranslationDuplicateKey,
          "create",
          submission,
        ),
        status: 409,
        targetId: `${submission.locale}:${submission.key}`,
        targetLabel: submission.key,
      });
    }

    if (isResourceForeignKeyConstraintError(error)) {
      throw buildConflictError({
        action,
        code: APP_ERROR_CODE.resources.translations.create.missingLocale,
        details: {
          key: submission.key,
          locale: submission.locale,
        },
        message: "Translation creation rejected because locale no longer exists",
        resource: APP_ERROR_RESOURCE.resourcesTranslations,
        responseData: buildTranslationConflictState(
          "locale",
          args.formCopy.errors.translationLocaleMissing,
          "create",
          submission,
        ),
        status: 409,
        targetId: `${submission.locale}:${submission.key}`,
        targetLabel: submission.key,
      });
    }

    throw error;
  }

  await purgeI18nDataCache(args.context, args.request, [submission.locale]);
  await recordAuditLog({
    action,
    context: args.context,
    details: {
      intent: args.intent,
      key: submission.key,
      locale: submission.locale,
    },
    message: "Translation created",
    request: args.request,
    resource: APP_ERROR_RESOURCE.resourcesTranslations,
    result: "success",
    statusCode: 302,
    targetId: `${submission.locale}:${submission.key}`,
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
