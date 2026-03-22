import { data } from "react-router";

import {
  buildLocaleFormValues,
  buildTranslationFormValues,
  toResourceBooleanValue,
} from "~/domain/resources/form";
import type {
  LocaleSubmission,
  TranslationSubmission,
} from "~/lib/resources/resources-form.server";

import type { DashboardResourcesActionState } from "./state";

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
  return data<DashboardResourcesActionState>(
    {
      actionError: message,
    },
    { status },
  );
}

export function buildLocaleFormStateResponse(args: {
  editingCode?: string | null;
  errors: NonNullable<DashboardResourcesActionState["localeForm"]>["errors"];
  mode: "create" | "edit";
  status: number;
  values: NonNullable<DashboardResourcesActionState["localeForm"]>["values"];
}) {
  return data<DashboardResourcesActionState>(
    {
      localeForm: {
        editingCode: args.editingCode ?? null,
        errors: args.errors,
        isOpen: true,
        mode: args.mode,
        values: args.values,
      },
    },
    { status: args.status },
  );
}

export function buildTranslationFormStateResponse(args: {
  editingKey?: string | null;
  editingLocale?: string | null;
  errors: NonNullable<DashboardResourcesActionState["translationForm"]>["errors"];
  mode: "create" | "edit";
  status: number;
  values: NonNullable<DashboardResourcesActionState["translationForm"]>["values"];
}) {
  return data<DashboardResourcesActionState>(
    {
      translationForm: {
        editingKey: args.editingKey ?? null,
        editingLocale: args.editingLocale ?? null,
        errors: args.errors,
        isOpen: true,
        mode: args.mode,
        values: args.values,
      },
    },
    { status: args.status },
  );
}
