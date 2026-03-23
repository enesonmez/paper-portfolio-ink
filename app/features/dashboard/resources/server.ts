import type { AppLoadContext } from "react-router";

import { requireDashboardActor } from "~/shared/authz/authz.server";
import { buildAuthorizationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";

import { buildDashboardResourcesFormCopy } from "./copy";
import { loadGrantedDashboardResourcesData } from "./loader.server";
import { handleDashboardResourcesMutation } from "./mutations.server";
import { buildResourcesPermissions, hasResourceReadAccess } from "./permissions";
import {
  buildDeniedDashboardResourcesLoaderData,
  type DashboardResourcesLoaderData,
} from "./state";

export async function loadDashboardResourcesData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardResourcesLoaderData | Response> {
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  const permissions = buildResourcesPermissions(auth.actor);

  if (!hasResourceReadAccess(permissions)) {
    throw buildAuthorizationError<DashboardResourcesLoaderData>({
      action: APP_ERROR_ACTION.read,
      code: APP_ERROR_CODE.resources.read.forbidden,
      message: "Resource dashboard access denied",
      resource: APP_ERROR_RESOURCE.resources,
      responseData: buildDeniedDashboardResourcesLoaderData(),
      status: 403,
    });
  }

  return loadGrantedDashboardResourcesData({
    context,
    permissions,
    request,
  });
}

export async function handleDashboardResourcesAction(
  context: AppLoadContext,
  request: Request,
) {
  const { locale, messages } = await loadI18nPayload(context, request);
  const t = createTranslator(messages);
  const formCopy = buildDashboardResourcesFormCopy(t);
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  return handleDashboardResourcesMutation({
    actor: auth.actor,
    context,
    currentLocale: locale,
    formCopy,
    request,
    t,
  });
}
