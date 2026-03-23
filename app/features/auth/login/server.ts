import { redirect, type AppLoadContext } from "react-router";

import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import {
  normalizeRedirectTarget,
  parseLoginFormData,
  signInWithEmail,
} from "~/shared/auth/login.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { resolveParsedSubmission } from "~/shared/errors/submission.server";
import { getSessionForRequest } from "~/shared/auth/session.server";

import type { LoginLoaderData } from "./state";

export async function loadLoginData(
  request: Request,
  context: AppLoadContext,
): Promise<LoginLoaderData | Response> {
  const { locale, supportedLocales } = await loadI18nPayload(context, request);
  const session = await getSessionForRequest(request, context);
  const redirectTo = normalizeRedirectTarget(
    new URL(request.url).searchParams.get("redirectTo"),
    locale,
    supportedLocales.map((item) => item.code),
  );

  if (session) {
    return redirect(redirectTo);
  }

  return {
    redirectTo,
  };
}

export async function handleLoginAction(request: Request, context: AppLoadContext) {
  const { locale, messages, supportedLocales } = await loadI18nPayload(
    context,
    request,
  );
  const t = createTranslator(messages);
  const formData = await request.formData();
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);
  const submission = resolveParsedSubmission({
    action: APP_ERROR_ACTION.login,
    code: APP_ERROR_CODE.auth.login.validation,
    message: "Login form validation failed",
    resource: APP_ERROR_RESOURCE.authLogin,
    submission: parseLoginFormData(formData, locale, t, supportedLocaleCodes),
  });

  return signInWithEmail({
    context,
    locale,
    request,
    submission,
    supportedLocaleCodes,
    t,
  });
}
