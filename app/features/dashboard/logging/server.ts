import type { AppLoadContext } from "react-router";

import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import { actorHasClaim, denyLoaderIfMissingClaim } from "~/shared/authz/guards";
import { requireDashboardActor } from "~/shared/authz/authz.server";
import { buildAuthorizationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { parseLoggingRangeFormData } from "~/lib/logging/logging-range-form.server";
import { loadDashboardLoggingOverview } from "~/lib/logging/logs.server";

import {
  handleDeleteLogErrorsMutation,
  handleExportLogErrorsMutation,
} from "./mutations.server";
import {
  buildGrantedLoggingLoaderData,
  buildDeniedLoaderData,
  normalizeLoggingTab,
  type DashboardLoggingActionData,
  type DashboardLoggingLoaderData,
} from "./state";

export async function loadDashboardLoggingData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardLoggingLoaderData | Response> {
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  const denied = denyLoaderIfMissingClaim(
    auth.actor,
    AUTHORIZATION_CLAIM.logsRead,
    buildDeniedLoaderData(),
  );

  if (denied) {
    throw buildAuthorizationError<DashboardLoggingLoaderData>({
      action: APP_ERROR_ACTION.read,
      code: APP_ERROR_CODE.logging.readForbidden,
      message: "Logging dashboard access denied",
      resource: APP_ERROR_RESOURCE.logs,
      responseData: denied,
      status: 403,
    });
  }

  const url = new URL(request.url);
  const selectedTab = normalizeLoggingTab(url.searchParams.get("tab"));
  const { errorEntries, historyEntries, totals } =
    await loadDashboardLoggingOverview(context);

  return buildGrantedLoggingLoaderData({
    errorEntries,
    historyEntries,
    permissions: {
      canDelete: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.logsDelete),
      canExport: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.logsExport),
    },
    selectedTab,
    totals: {
      errors: totals.errorCount,
      history: totals.historyCount,
    },
  });
}

export async function handleDashboardLoggingAction(
  context: AppLoadContext,
  request: Request,
) {
  const { messages } = await loadI18nPayload(context, request);
  const t = createTranslator(messages);
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  const readDenied = denyLoaderIfMissingClaim(
    auth.actor,
    AUTHORIZATION_CLAIM.logsRead,
    {
      notice: t("dashboard.authz.forbiddenError"),
    } satisfies DashboardLoggingActionData,
  );

  if (readDenied) {
    throw buildAuthorizationError({
      action: APP_ERROR_ACTION.read,
      code: APP_ERROR_CODE.logging.readForbidden,
      message: "Logging dashboard action denied",
      resource: APP_ERROR_RESOURCE.logs,
      responseData: readDenied,
      status: 403,
    });
  }

  const formData = await request.formData();
  const { endAt, intent, startAt, values } = parseLoggingRangeFormData(formData, t);

  if (intent === "export-errors") {
    return handleExportLogErrorsMutation({
      actor: auth.actor,
      context,
      endAt,
      request,
      startAt,
      t,
      values,
    });
  }

  return handleDeleteLogErrorsMutation({
    actor: auth.actor,
    context,
    endAt,
    request,
    startAt,
    t,
    values,
  });
}
