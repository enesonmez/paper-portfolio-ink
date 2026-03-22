import type { AppLoadContext } from "react-router";

import {
  hasParsedTranslationData,
  parseTranslationFormData,
} from "~/lib/resources/resources-form.server";
import {
  createTranslation,
  deleteTranslation,
  isResourceForeignKeyConstraintError,
  isUniqueTranslationConstraintError,
  updateTranslation,
  type LocaleResourceRecord,
} from "~/lib/resources/resources.server";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/domain/resources/contract";
import { purgeI18nDataCache } from "~/shared/i18n/i18n.server";
import { readStringField } from "~/shared/forms/form-data.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

import type { DashboardResourcesFormCopy } from "./copy";
import {
  buildActionErrorState,
  buildTranslationFormStateResponse,
  buildTranslationFormValuesFromSubmission,
} from "./action-state.server";
import { redirectToResources } from "./navigation.server";

interface HandleTranslationResourceMutationArgs {
  beforeLocales: readonly LocaleResourceRecord[];
  context: AppLoadContext;
  currentLocale: string;
  formCopy: DashboardResourcesFormCopy;
  formData: FormData;
  intent: string;
  request: Request;
  t: I18nTranslator;
}

export async function handleTranslationResourceMutation(
  args: HandleTranslationResourceMutationArgs,
) {
  const db = args.context.db;
  const allLocaleCodes = args.beforeLocales.map((localeRow) => localeRow.code);

  if (allLocaleCodes.length === 0) {
    return buildActionErrorState(args.formCopy.errors.translationLocaleMissing, 409);
  }

  if (args.intent === RESOURCE_MUTATION_INTENT.deleteTranslation) {
    const originalLocale = readStringField(
      args.formData,
      RESOURCE_FORM_FIELD.originalLocale,
    );
    const originalKey = readStringField(args.formData, RESOURCE_FORM_FIELD.originalKey);

    if (!originalLocale || !originalKey) {
      return buildActionErrorState(args.formCopy.errors.deleteTranslationMissing, 400);
    }

    const wasDeleted = await deleteTranslation(db, originalLocale, originalKey);

    if (!wasDeleted) {
      return buildActionErrorState(args.formCopy.errors.deleteTranslationMissing, 404);
    }

    await purgeI18nDataCache(args.context, args.request, [originalLocale]);

    return redirectToResources({
      currentLocale: args.currentLocale,
      localeRows: args.beforeLocales,
      section: "translations",
      translationLocale: originalLocale,
      translationSearch: "",
    });
  }

  if (args.intent === RESOURCE_MUTATION_INTENT.createTranslation) {
    const submission = parseTranslationFormData(args.formData, allLocaleCodes, args.t);

    if (!hasParsedTranslationData(submission)) {
      return buildTranslationFormStateResponse({
        errors: submission.errors,
        mode: "create",
        status: 400,
        values: submission.values,
      });
    }

    try {
      await createTranslation(db, submission.data);
    } catch (error) {
      if (isUniqueTranslationConstraintError(error)) {
        return buildTranslationFormStateResponse({
          errors: {
            key: args.formCopy.errors.createTranslationDuplicateKey,
          },
          mode: "create",
          status: 409,
          values: buildTranslationFormValuesFromSubmission(submission.data),
        });
      }

      if (isResourceForeignKeyConstraintError(error)) {
        return buildTranslationFormStateResponse({
          errors: {
            locale: args.formCopy.errors.translationLocaleMissing,
          },
          mode: "create",
          status: 409,
          values: buildTranslationFormValuesFromSubmission(submission.data),
        });
      }

      throw error;
    }

    await purgeI18nDataCache(args.context, args.request, [submission.data.locale]);

    return redirectToResources({
      currentLocale: args.currentLocale,
      localeRows: args.beforeLocales,
      section: "translations",
      translationLocale: submission.data.locale,
      translationSearch: "",
    });
  }

  const originalLocale = readStringField(
    args.formData,
    RESOURCE_FORM_FIELD.originalLocale,
  );
  const originalKey = readStringField(args.formData, RESOURCE_FORM_FIELD.originalKey);
  const submission = parseTranslationFormData(args.formData, allLocaleCodes, args.t);

  if (!hasParsedTranslationData(submission)) {
    return buildTranslationFormStateResponse({
      editingKey: originalKey,
      editingLocale: originalLocale,
      errors: submission.errors,
      mode: "edit",
      status: 400,
      values: submission.values,
    });
  }

  if (!originalLocale || !originalKey) {
    return buildTranslationFormStateResponse({
      errors: {
        form: args.formCopy.errors.updateTranslationMissing,
      },
      mode: "edit",
      status: 400,
      values: buildTranslationFormValuesFromSubmission(submission.data),
    });
  }

  try {
    const wasUpdated = await updateTranslation(
      db,
      originalLocale,
      originalKey,
      submission.data,
    );

    if (!wasUpdated) {
      return buildTranslationFormStateResponse({
        editingKey: originalKey,
        editingLocale: originalLocale,
        errors: {
          form: args.formCopy.errors.updateTranslationMissing,
        },
        mode: "edit",
        status: 404,
        values: buildTranslationFormValuesFromSubmission(submission.data),
      });
    }
  } catch (error) {
    if (isUniqueTranslationConstraintError(error)) {
      return buildTranslationFormStateResponse({
        editingKey: originalKey,
        editingLocale: originalLocale,
        errors: {
          key: args.formCopy.errors.updateTranslationDuplicateKey,
        },
        mode: "edit",
        status: 409,
        values: buildTranslationFormValuesFromSubmission(submission.data),
      });
    }

    if (isResourceForeignKeyConstraintError(error)) {
      return buildTranslationFormStateResponse({
        editingKey: originalKey,
        editingLocale: originalLocale,
        errors: {
          locale: args.formCopy.errors.translationLocaleMissing,
        },
        mode: "edit",
        status: 409,
        values: buildTranslationFormValuesFromSubmission(submission.data),
      });
    }

    throw error;
  }

  await purgeI18nDataCache(args.context, args.request, [
    originalLocale,
    submission.data.locale,
  ]);

  return redirectToResources({
    currentLocale: args.currentLocale,
    localeRows: args.beforeLocales,
    section: "translations",
    translationLocale: submission.data.locale,
    translationSearch: "",
  });
}
