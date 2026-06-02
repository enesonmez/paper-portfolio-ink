import { redirect, type AppLoadContext } from "react-router";

import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildValidationError } from "~/shared/errors/builders.server";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";
import type { AuthorizationActor } from "~/shared/authz/actor";
import { readStringField } from "~/shared/forms/form-data.server";

import { SETTINGS_MUTATION_FORM_FIELD } from "../contracts";
import { RUNTIME_CACHE_ENTRY, type RuntimeCacheEntryId } from "../runtime/state";
import { refreshRuntimeCacheEntry } from "./runtime-cache.server";
import { buildDashboardSettingsHref, DASHBOARD_SETTINGS_TAB } from "../state";

function isRuntimeCacheEntryId(value: string): value is RuntimeCacheEntryId {
  return Object.values(RUNTIME_CACHE_ENTRY).includes(value as RuntimeCacheEntryId);
}

export async function handleRefreshRuntimeCacheMutation(args: {
  actor: AuthorizationActor;
  context: AppLoadContext;
  formData: FormData;
  intent: string;
  locale: string;
  request: Request;
  supportedLocaleCodes: readonly string[];
}) {
  const cacheId = readStringField(args.formData, SETTINGS_MUTATION_FORM_FIELD.cacheId);

  if (!isRuntimeCacheEntryId(cacheId)) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.settings.validation,
      details: {
        cacheId,
      },
      message: "Runtime cache refresh received an unsupported cache id",
      resource: APP_ERROR_RESOURCE.settings,
      status: 400,
    });
  }

  await refreshRuntimeCacheEntry({
    actor: args.actor,
    cacheId,
    context: args.context,
    request: args.request,
  });

  await recordAuditLog({
    action: APP_ERROR_ACTION.update,
    context: args.context,
    details: {
      cacheId,
      intent: args.intent,
    },
    message: "Runtime cache refreshed",
    request: args.request,
    resource: APP_ERROR_RESOURCE.settings,
    result: "success",
    statusCode: 302,
    targetId: cacheId,
    targetLabel: cacheId,
  });

  return redirect(
    buildLocalizedPath(
      args.locale,
      buildDashboardSettingsHref(DASHBOARD_SETTINGS_TAB.runtime),
      args.supportedLocaleCodes,
    ),
  );
}
