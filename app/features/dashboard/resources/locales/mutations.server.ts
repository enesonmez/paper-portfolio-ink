import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/domain/resources/contract";
import {
  parseLocaleFormData,
  type LocaleSubmission,
} from "~/lib/resources/resources-form.server";
import {
  createLocale,
  deleteLocale,
  isUniqueLocaleConstraintError,
  listLocales,
  updateLocale,
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
  buildLocaleFormStateResponse,
  buildLocaleFormValuesFromSubmission,
} from "../action-state.server";
import type { DashboardResourcesFormCopy } from "../copy";
import {
  buildLocaleCodeUnion,
  getRequestedLocaleFromPathname,
  pickNextDefaultLocaleCode,
  redirectToResources,
} from "../navigation.server";

interface LocaleMutationArgs<TIntent extends string> {
  actor: AuthorizationActor;
  context: AppLoadContext;
  currentLocale: string;
  formCopy: DashboardResourcesFormCopy;
  formData: FormData;
  intent: TIntent;
  request: Request;
  t: I18nTranslator;
}

function buildLocaleForbiddenState(formCopy: DashboardResourcesFormCopy) {
  return buildActionErrorState(formCopy.errors.forbidden, 403);
}

function buildLocaleConflictState(
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

function resolveLocaleMutationPolicy(
  intent:
    | typeof RESOURCE_MUTATION_INTENT.createLocale
    | typeof RESOURCE_MUTATION_INTENT.deleteLocale
    | typeof RESOURCE_MUTATION_INTENT.updateLocale,
) {
  switch (intent) {
    case RESOURCE_MUTATION_INTENT.createLocale:
      return {
        action: APP_ERROR_ACTION.create,
        claim: AUTHORIZATION_CLAIM.resourcesLocalesCreate,
      } as const;

    case RESOURCE_MUTATION_INTENT.deleteLocale:
      return {
        action: APP_ERROR_ACTION.delete,
        claim: AUTHORIZATION_CLAIM.resourcesLocalesDelete,
      } as const;

    case RESOURCE_MUTATION_INTENT.updateLocale:
      return {
        action: APP_ERROR_ACTION.update,
        claim: AUTHORIZATION_CLAIM.resourcesLocalesUpdate,
      } as const;
  }

  throw new Error("Unsupported locale mutation intent");
}

function ensureLocaleMutationAuthorized(
  actor: AuthorizationActor,
  formCopy: DashboardResourcesFormCopy,
  intent:
    | typeof RESOURCE_MUTATION_INTENT.createLocale
    | typeof RESOURCE_MUTATION_INTENT.deleteLocale
    | typeof RESOURCE_MUTATION_INTENT.updateLocale,
) {
  const policy = resolveLocaleMutationPolicy(intent);
  const forbidden = denyActionIfMissingClaim(
    actor,
    policy.claim,
    buildLocaleForbiddenState(formCopy),
  );

  if (forbidden) {
    throw buildAuthorizationError({
      action: policy.action,
      code: APP_ERROR_CODE.resources.mutation.forbidden,
      details: {
        intent,
        requiredClaim: policy.claim,
      },
      message: "Locale mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: forbidden,
      status: 403,
    });
  }

  return policy;
}

function getLocaleCodes(localeRows: readonly LocaleResourceRecord[]) {
  return localeRows.map((localeRow) => localeRow.code);
}

async function loadLocaleRows(context: AppLoadContext) {
  return listLocales(getDbFromContext(context));
}

function parseLocaleSubmission(
  formData: FormData,
  t: I18nTranslator,
  action: typeof APP_ERROR_ACTION.create | typeof APP_ERROR_ACTION.update,
) {
  return resolveParsedSubmission({
    action,
    code: APP_ERROR_CODE.resources.locales.validation,
    message: "Locale form validation failed",
    resource: APP_ERROR_RESOURCE.resourcesLocales,
    submission: parseLocaleFormData(formData, t),
  });
}

export async function handleDeleteLocaleMutation(
  args: LocaleMutationArgs<typeof RESOURCE_MUTATION_INTENT.deleteLocale>,
) {
  const action = APP_ERROR_ACTION.delete;
  ensureLocaleMutationAuthorized(args.actor, args.formCopy, args.intent);
  const db = getDbFromContext(args.context);
  const beforeLocales = await loadLocaleRows(args.context);
  const localeCodesBefore = getLocaleCodes(beforeLocales);
  const originalCode = readStringField(args.formData, RESOURCE_FORM_FIELD.originalCode);

  if (!originalCode) {
    throw buildValidationError({
      action,
      code: APP_ERROR_CODE.resources.locales.delete.missingId,
      message: "Locale delete action missing target identifier",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildActionErrorState(
        args.formCopy.errors.deleteLocaleMissing,
        400,
      ),
    });
  }

  const localeToDelete = beforeLocales.find(
    (localeRow) => localeRow.code === originalCode,
  );

  if (!localeToDelete) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.delete.notFound,
      message: "Locale delete action could not find target locale",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildActionErrorState(args.formCopy.errors.localeMissing, 404),
      status: 404,
      targetId: originalCode,
    });
  }

  const activeLocaleCount = beforeLocales.filter(
    (localeRow) => localeRow.isActive,
  ).length;

  if (localeToDelete.isActive && activeLocaleCount === 1) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.delete.lastActiveGuard,
      message: "Locale delete rejected because it would remove the last active locale",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildActionErrorState(
        args.formCopy.errors.deleteLocaleRestricted,
        409,
      ),
      status: 409,
      targetId: originalCode,
      targetLabel: localeToDelete.label,
    });
  }

  const promotedDefaultCode = localeToDelete.isDefault
    ? pickNextDefaultLocaleCode(beforeLocales, localeToDelete.code)
    : null;

  if (localeToDelete.isDefault && !promotedDefaultCode) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.delete.defaultGuard,
      message: "Locale delete rejected because no default fallback locale exists",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildActionErrorState(
        args.formCopy.errors.deleteLocaleRestricted,
        409,
      ),
      status: 409,
      targetId: originalCode,
      targetLabel: localeToDelete.label,
    });
  }

  await deleteLocale(db, originalCode, {
    promotedDefaultCode: promotedDefaultCode ?? undefined,
  });

  const afterLocales = await loadLocaleRows(args.context);

  await purgeI18nDataCache(
    args.context,
    args.request,
    buildLocaleCodeUnion(localeCodesBefore, getLocaleCodes(afterLocales)),
  );
  await recordAuditLog({
    action,
    context: args.context,
    details: {
      intent: args.intent,
      promotedDefaultCode,
    },
    message: "Locale deleted",
    request: args.request,
    resource: APP_ERROR_RESOURCE.resourcesLocales,
    result: "success",
    statusCode: 302,
    targetId: originalCode,
    targetLabel: localeToDelete.label,
  });

  return redirectToResources({
    currentLocale: args.currentLocale,
    localeRows: afterLocales,
    section: "locales",
    translationSearch: "",
  });
}

export async function handleCreateLocaleMutation(
  args: LocaleMutationArgs<typeof RESOURCE_MUTATION_INTENT.createLocale>,
) {
  const action = APP_ERROR_ACTION.create;
  ensureLocaleMutationAuthorized(args.actor, args.formCopy, args.intent);
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
          "create",
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

export async function handleUpdateLocaleMutation(
  args: LocaleMutationArgs<typeof RESOURCE_MUTATION_INTENT.updateLocale>,
) {
  const action = APP_ERROR_ACTION.update;
  ensureLocaleMutationAuthorized(args.actor, args.formCopy, args.intent);
  const db = getDbFromContext(args.context);
  const beforeLocales = await loadLocaleRows(args.context);
  const localeCodesBefore = getLocaleCodes(beforeLocales);
  const originalCode = readStringField(args.formData, RESOURCE_FORM_FIELD.originalCode);
  const requestedLocale = getRequestedLocaleFromPathname(args.request);
  const submission = parseLocaleSubmission(args.formData, args.t, action);

  if (!originalCode) {
    throw buildValidationError({
      action,
      code: APP_ERROR_CODE.resources.locales.update.missingId,
      message: "Locale update action missing target identifier",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildLocaleFormStateResponse({
        errors: {
          form: args.formCopy.errors.updateLocaleMissing,
        },
        editingCode: null,
        mode: "edit",
        status: 400,
        values: buildLocaleFormValuesFromSubmission(submission),
      }),
    });
  }

  const localeToUpdate = beforeLocales.find(
    (localeRow) => localeRow.code === originalCode,
  );

  if (!localeToUpdate) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.update.notFound,
      message: "Locale update action could not find target locale",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildLocaleFormStateResponse({
        errors: {
          form: args.formCopy.errors.localeMissing,
        },
        editingCode: originalCode,
        mode: "edit",
        status: 404,
        values: buildLocaleFormValuesFromSubmission(submission),
      }),
      status: 404,
      targetId: originalCode,
    });
  }

  const activeLocaleCount = beforeLocales.filter(
    (localeRow) => localeRow.isActive,
  ).length;

  if (localeToUpdate.isActive && !submission.isActive && activeLocaleCount === 1) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.update.lastActiveGuard,
      message:
        "Locale update rejected because it would deactivate the last active locale",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildLocaleFormStateResponse({
        errors: {
          form: args.formCopy.errors.deleteLocaleRestricted,
        },
        editingCode: originalCode,
        mode: "edit",
        status: 409,
        values: buildLocaleFormValuesFromSubmission(submission),
      }),
      status: 409,
      targetId: originalCode,
      targetLabel: submission.label,
    });
  }

  const promotedDefaultCode =
    localeToUpdate.isDefault && !submission.isDefault
      ? pickNextDefaultLocaleCode(beforeLocales, localeToUpdate.code)
      : null;

  if (localeToUpdate.isDefault && !submission.isDefault && !promotedDefaultCode) {
    throw buildBusinessError({
      action,
      code: APP_ERROR_CODE.resources.locales.update.defaultGuard,
      message: "Locale update rejected because no default fallback locale exists",
      resource: APP_ERROR_RESOURCE.resourcesLocales,
      responseData: buildLocaleFormStateResponse({
        errors: {
          form: args.formCopy.errors.deleteLocaleRestricted,
        },
        editingCode: originalCode,
        mode: "edit",
        status: 409,
        values: buildLocaleFormValuesFromSubmission(submission),
      }),
      status: 409,
      targetId: originalCode,
      targetLabel: submission.label,
    });
  }

  try {
    await updateLocale(db, originalCode, submission, {
      promotedDefaultCode: promotedDefaultCode ?? undefined,
    });
  } catch (error) {
    if (isUniqueLocaleConstraintError(error)) {
      throw buildConflictError({
        action,
        code: APP_ERROR_CODE.resources.locales.update.duplicateCode,
        details: {
          code: submission.code,
          originalCode,
        },
        message: "Locale update rejected because code is already taken",
        resource: APP_ERROR_RESOURCE.resourcesLocales,
        responseData: buildLocaleConflictState(
          args.formCopy.errors.updateLocaleDuplicateCode,
          "edit",
          submission,
          originalCode,
        ),
        status: 409,
        targetId: originalCode,
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
      originalCode,
      submission.code,
    ]),
  );
  await recordAuditLog({
    action,
    context: args.context,
    details: {
      code: submission.code,
      intent: args.intent,
      originalCode,
      promotedDefaultCode,
    },
    message: "Locale updated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.resourcesLocales,
    result: "success",
    statusCode: 302,
    targetId: originalCode,
    targetLabel: submission.label,
  });

  return redirectToResources({
    currentLocale: args.currentLocale,
    localeRows: afterLocales,
    preferredLocale:
      requestedLocale === originalCode
        ? submission.code
        : (requestedLocale ?? args.currentLocale),
    section: "locales",
    translationSearch: "",
  });
}
