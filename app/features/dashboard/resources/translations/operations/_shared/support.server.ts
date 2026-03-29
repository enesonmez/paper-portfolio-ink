import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../../../db/context";
import {
  parseTranslationFormData,
  type TranslationSubmission,
} from "~/lib/resources/resources-form.server";
import {
  listLocales,
  type LocaleResourceRecord,
} from "~/lib/resources/resources.server";
import { buildBusinessError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  type AppErrorAction,
} from "~/shared/errors/contracts";
import { resolveParsedSubmission } from "~/shared/errors/submission.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

import {
  buildActionErrorState,
  buildTranslationFormStateResponse,
  buildTranslationFormValuesFromSubmission,
} from "../../../forms/form-state.server";
import type { DashboardResourcesFormCopy } from "../../../copy";

export interface TranslationMutationArgs<TIntent extends string> {
  context: AppLoadContext;
  currentLocale: string;
  formCopy: DashboardResourcesFormCopy;
  formData: FormData;
  intent: TIntent;
  request: Request;
  t: I18nTranslator;
}

export function buildTranslationConflictState(
  copyField: "key" | "locale",
  copyMessage: string,
  mode: "create" | "edit",
  submission: TranslationSubmission,
  editingKey?: string | null,
  editingLocale?: string | null,
) {
  return buildTranslationFormStateResponse({
    editingKey,
    editingLocale,
    errors: {
      [copyField]: copyMessage,
    },
    mode,
    status: 409,
    values: buildTranslationFormValuesFromSubmission(submission),
  });
}

export function getLocaleCodes(localeRows: readonly LocaleResourceRecord[]) {
  return localeRows.map((localeRow) => localeRow.code);
}

export async function loadLocaleRows(context: AppLoadContext) {
  return listLocales(getDbFromContext(context));
}

export function ensureTranslationLocaleRegistry(
  action: Extract<AppErrorAction, "create" | "delete" | "update">,
  formCopy: DashboardResourcesFormCopy,
  localeRows: readonly LocaleResourceRecord[],
) {
  if (localeRows.length > 0) {
    return getLocaleCodes(localeRows);
  }

  throw buildBusinessError({
    action,
    code: APP_ERROR_CODE.resources.translations.missingLocaleRegistry,
    message: "Translation mutation requires at least one locale",
    resource: APP_ERROR_RESOURCE.resourcesTranslations,
    responseData: buildActionErrorState(formCopy.errors.translationLocaleMissing, 409),
    status: 409,
  });
}

export function parseTranslationSubmission(
  action: Extract<AppErrorAction, "create" | "update">,
  formData: FormData,
  localeCodes: readonly string[],
  t: I18nTranslator,
) {
  return resolveParsedSubmission({
    action,
    code: APP_ERROR_CODE.resources.translations.validation,
    message: "Translation form validation failed",
    resource: APP_ERROR_RESOURCE.resourcesTranslations,
    submission: parseTranslationFormData(formData, localeCodes, t),
  });
}
