import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/domain/resources/contract";
import {
  parseTranslationFormData,
  type TranslationSubmission,
} from "~/lib/resources/resources-form.server";
import {
  createTranslation,
  deleteTranslation,
  isResourceForeignKeyConstraintError,
  isUniqueTranslationConstraintError,
  listLocales,
  updateTranslation,
  type LocaleResourceRecord,
} from "~/lib/resources/resources.server";
import type { AuthorizationActor } from "~/shared/authz/actor";
import { denyActionIfMissingClaim } from "~/shared/authz/guards";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import {
  buildAuthorizationError,
  buildBusinessError,
  buildConflictError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { resolveParsedSubmission } from "~/shared/errors/submission.server";
import { readStringField } from "~/shared/forms/form-data.server";
import { purgeI18nDataCache } from "~/shared/i18n/i18n.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  buildActionErrorState,
  buildTranslationFormStateResponse,
  buildTranslationFormValuesFromSubmission,
} from "../action-state.server";
import type { DashboardResourcesFormCopy } from "../copy";
import { redirectToResources } from "../navigation.server";

interface TranslationMutationArgs<TIntent extends string> {
  actor: AuthorizationActor;
  context: AppLoadContext;
  currentLocale: string;
  formCopy: DashboardResourcesFormCopy;
  formData: FormData;
  intent: TIntent;
  request: Request;
  t: I18nTranslator;
}

function buildTranslationForbiddenState(formCopy: DashboardResourcesFormCopy) {
  return buildActionErrorState(formCopy.errors.forbidden, 403);
}

function buildTranslationConflictState(
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

function resolveTranslationMutationPolicy(
  intent:
    | typeof RESOURCE_MUTATION_INTENT.createTranslation
    | typeof RESOURCE_MUTATION_INTENT.deleteTranslation
    | typeof RESOURCE_MUTATION_INTENT.updateTranslation,
) {
  switch (intent) {
    case RESOURCE_MUTATION_INTENT.createTranslation:
      return {
        action: APP_ERROR_ACTION.create,
        claim: AUTHORIZATION_CLAIM.resourcesTranslationsCreate,
      } as const;

    case RESOURCE_MUTATION_INTENT.deleteTranslation:
      return {
        action: APP_ERROR_ACTION.delete,
        claim: AUTHORIZATION_CLAIM.resourcesTranslationsDelete,
      } as const;

    case RESOURCE_MUTATION_INTENT.updateTranslation:
      return {
        action: APP_ERROR_ACTION.update,
        claim: AUTHORIZATION_CLAIM.resourcesTranslationsUpdate,
      } as const;
  }

  throw new Error("Unsupported translation mutation intent");
}

function ensureTranslationMutationAuthorized(
  actor: AuthorizationActor,
  formCopy: DashboardResourcesFormCopy,
  intent:
    | typeof RESOURCE_MUTATION_INTENT.createTranslation
    | typeof RESOURCE_MUTATION_INTENT.deleteTranslation
    | typeof RESOURCE_MUTATION_INTENT.updateTranslation,
) {
  const policy = resolveTranslationMutationPolicy(intent);
  const forbidden = denyActionIfMissingClaim(
    actor,
    policy.claim,
    buildTranslationForbiddenState(formCopy),
  );

  if (forbidden) {
    throw buildAuthorizationError({
      action: policy.action,
      code: APP_ERROR_CODE.resources.mutation.forbidden,
      details: {
        intent,
        requiredClaim: policy.claim,
      },
      message: "Translation mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.resourcesTranslations,
      responseData: forbidden,
      status: 403,
    });
  }

  return policy;
}

async function loadLocaleRows(context: AppLoadContext) {
  return listLocales(getDbFromContext(context));
}

function getLocaleCodes(localeRows: readonly LocaleResourceRecord[]) {
  return localeRows.map((localeRow) => localeRow.code);
}

function ensureTranslationLocaleRegistry(
  action:
    | typeof APP_ERROR_ACTION.create
    | typeof APP_ERROR_ACTION.delete
    | typeof APP_ERROR_ACTION.update,
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

function parseTranslationSubmission(
  action: typeof APP_ERROR_ACTION.create | typeof APP_ERROR_ACTION.update,
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

export async function handleDeleteTranslationMutation(
  args: TranslationMutationArgs<typeof RESOURCE_MUTATION_INTENT.deleteTranslation>,
) {
  const action = APP_ERROR_ACTION.delete;
  ensureTranslationMutationAuthorized(args.actor, args.formCopy, args.intent);
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

export async function handleCreateTranslationMutation(
  args: TranslationMutationArgs<typeof RESOURCE_MUTATION_INTENT.createTranslation>,
) {
  const action = APP_ERROR_ACTION.create;
  ensureTranslationMutationAuthorized(args.actor, args.formCopy, args.intent);
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

export async function handleUpdateTranslationMutation(
  args: TranslationMutationArgs<typeof RESOURCE_MUTATION_INTENT.updateTranslation>,
) {
  const action = APP_ERROR_ACTION.update;
  ensureTranslationMutationAuthorized(args.actor, args.formCopy, args.intent);
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
        mode: "edit",
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
          mode: "edit",
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
          "edit",
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
          "edit",
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
