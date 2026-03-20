import { data, redirect, type AppLoadContext } from "react-router";

import {
  hasParsedLoginData,
  normalizeRedirectTarget,
  parseLoginFormData,
  signInWithEmail,
} from "~/lib/auth/login.server";
import { getSessionForRequest } from "~/lib/auth/session.server";

import type { LoginLoaderData } from "./login.shared";

export async function loadLoginData(
  request: Request,
  context: AppLoadContext,
): Promise<LoginLoaderData | Response> {
  const session = await getSessionForRequest(request, context);
  const redirectTo = normalizeRedirectTarget(
    new URL(request.url).searchParams.get("redirectTo"),
  );

  if (session) {
    return redirect(redirectTo);
  }

  return {
    redirectTo,
  };
}

export async function handleLoginAction(request: Request, context: AppLoadContext) {
  const formData = await request.formData();
  const submission = parseLoginFormData(formData);

  if (!hasParsedLoginData(submission)) {
    return data(submission, {
      status: 400,
    });
  }

  return signInWithEmail({
    context,
    request,
    submission: submission.data,
  });
}
