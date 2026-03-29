import {
  buildLocaleFormValues,
  buildTranslationFormValues,
  toResourceBooleanValue,
} from "~/domain/resources/form";
import type {
  LocaleSubmission,
  TranslationSubmission,
} from "~/lib/resources/resources-form.server";

import type { DashboardResourcesActionState } from "../state";

export function buildLocaleFormValuesFromSubmission(submission: LocaleSubmission) {
  return buildLocaleFormValues({
    code: submission.code,
    isActive: toResourceBooleanValue(submission.isActive),
    isDefault: toResourceBooleanValue(submission.isDefault),
    label: submission.label,
    sortOrder: submission.sortOrder.toString(),
  });
}

export function buildTranslationFormValuesFromSubmission(
  submission: TranslationSubmission,
) {
  return buildTranslationFormValues({
    key: submission.key,
    locale: submission.locale,
    value: submission.value,
  });
}

export function buildActionErrorState(message: string, status = 400) {
  void status;

  return {
    actionError: message,
  } satisfies DashboardResourcesActionState;
}

export function buildLocaleFormStateResponse(args: {
  editingCode?: string | null;
  errors: NonNullable<DashboardResourcesActionState["localeForm"]>["errors"];
  mode: "create" | "edit";
  status: number;
  values: NonNullable<DashboardResourcesActionState["localeForm"]>["values"];
}) {
  return {
    localeForm: {
      editingCode: args.editingCode ?? null,
      errors: args.errors,
      isOpen: true,
      mode: args.mode,
      values: args.values,
    },
  } satisfies DashboardResourcesActionState;
}

export function buildTranslationFormStateResponse(args: {
  editingKey?: string | null;
  editingLocale?: string | null;
  errors: NonNullable<DashboardResourcesActionState["translationForm"]>["errors"];
  mode: "create" | "edit";
  status: number;
  values: NonNullable<DashboardResourcesActionState["translationForm"]>["values"];
}) {
  return {
    translationForm: {
      editingKey: args.editingKey ?? null,
      editingLocale: args.editingLocale ?? null,
      errors: args.errors,
      isOpen: true,
      mode: args.mode,
      values: args.values,
    },
  } satisfies DashboardResourcesActionState;
}
