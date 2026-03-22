import { data, redirect, type AppLoadContext } from "react-router";

import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import {
  hasParsedLoginData,
  normalizeRedirectTarget,
  parseLoginFormData,
  signInWithEmail,
} from "~/shared/auth/login.server";
import { getSessionForRequest } from "~/shared/auth/session.server";

import type { LoginLoaderData } from "./login.shared";

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
  const submission = parseLoginFormData(formData, locale, t, supportedLocaleCodes);

  if (!hasParsedLoginData(submission)) {
    return data(submission, {
      status: 400,
    });
  }

  return signInWithEmail({
    context,
    locale,
    request,
    submission: submission.data,
    supportedLocaleCodes,
    t,
  });
}
