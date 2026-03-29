import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../../../db/context";
import {
  parseLocaleFormData,
  type LocaleSubmission,
} from "~/lib/resources/resources-form.server";
import {
  listLocales,
  type LocaleResourceRecord,
} from "~/lib/resources/resources.server";
import {
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  type AppErrorAction,
} from "~/shared/errors/contracts";
import { resolveParsedSubmission } from "~/shared/errors/submission.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

import {
  buildLocaleFormStateResponse,
  buildLocaleFormValuesFromSubmission,
} from "../../../forms/form-state.server";
import type { DashboardResourcesFormCopy } from "../../../copy";

export interface LocaleMutationArgs<TIntent extends string> {
  context: AppLoadContext;
  currentLocale: string;
  formCopy: DashboardResourcesFormCopy;
  formData: FormData;
  intent: TIntent;
  request: Request;
  t: I18nTranslator;
}

export function buildLocaleConflictState(
  copyMessage: string,
  mode: "create" | "edit",
  submission: LocaleSubmission,
  editingCode?: string | null,
) {
  return buildLocaleFormStateResponse({
    editingCode,
    errors: {
      code: copyMessage,
    },
    mode,
    status: 409,
    values: buildLocaleFormValuesFromSubmission(submission),
  });
}

export function getLocaleCodes(localeRows: readonly LocaleResourceRecord[]) {
  return localeRows.map((localeRow) => localeRow.code);
}

export async function loadLocaleRows(context: AppLoadContext) {
  return listLocales(getDbFromContext(context));
}

export function parseLocaleSubmission(
  formData: FormData,
  t: I18nTranslator,
  action: Extract<AppErrorAction, "create" | "update">,
) {
  return resolveParsedSubmission({
    action,
    code: APP_ERROR_CODE.resources.locales.validation,
    message: "Locale form validation failed",
    resource: APP_ERROR_RESOURCE.resourcesLocales,
    submission: parseLocaleFormData(formData, t),
  });
}
