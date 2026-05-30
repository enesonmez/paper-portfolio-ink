import { getDbFromContext } from "../../../../../../db/context";
import {
  createLocale,
  isUniqueLocaleConstraintError,
} from "~/lib/resources/resources.server";
import { buildConflictError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { purgeI18nDataCache } from "~/shared/i18n/i18n.server";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  buildLocaleCodeUnion,
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

export async function handleCreateLocaleMutation(
  args: LocaleMutationArgs<"create-locale">,
) {
  const action = APP_ERROR_ACTION.create;
  const db = getDbFromContext(args.context);
  const beforeLocales = await loadLocaleRows(args.context);
  const localeCodesBefore = getLocaleCodes(beforeLocales);
  const submission = parseLocaleSubmission(args.formData, args.t, action);

  try {
    await createLocale(db, submission);
  } catch (error) {
    if (isUniqueLocaleConstraintError(error)) {
      throw buildConflictError({
        action,
        code: APP_ERROR_CODE.resources.locales.create.duplicateCode,
        details: {
          code: submission.code,
        },
        message: "Locale creation rejected because code is already taken",
        resource: APP_ERROR_RESOURCE.resourcesLocales,
        responseData: buildLocaleConflictState(
          args.formCopy.errors.createLocaleDuplicateCode,
          DASHBOARD_RESOURCES_FORM_MODE.create,
          submission,
        ),
        status: 409,
        targetId: submission.code,
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
      submission.code,
    ]),
  );
  await recordAuditLog({
    action,
    context: args.context,
    details: {
      code: submission.code,
      intent: args.intent,
    },
    message: "Locale created",
    request: args.request,
    resource: APP_ERROR_RESOURCE.resourcesLocales,
    result: "success",
    statusCode: 302,
    targetId: submission.code,
    targetLabel: submission.label,
  });

  return redirectToResources({
    currentLocale: args.currentLocale,
    localeRows: afterLocales,
    section: "locales",
    translationSearch: "",
  });
}
