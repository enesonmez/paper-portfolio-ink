import { redirect, redirectDocument, type AppLoadContext } from "react-router";

import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { loadI18nRuntimeState } from "~/shared/i18n/i18n.server";
import { resolveAuthConfig } from "~/shared/auth/auth-config.server";
import { createAuth } from "~/shared/auth/auth.server";

interface PerformLogoutOptions {
  context: AppLoadContext;
  request: Request;
}

export async function redirectLoggedOutUsers(
  context: AppLoadContext,
  request: Request,
) {
  const { locale, supportedLocaleCodes } = await loadI18nRuntimeState(context, request);

  return redirect(buildLocalizedPath(locale, "/login", supportedLocaleCodes));
}

export async function performLogout({ context, request }: PerformLogoutOptions) {
  const { locale, supportedLocaleCodes } = await loadI18nRuntimeState(context, request);
  const auth = createAuth({
    db: context.db,
    ...resolveAuthConfig(request, context.auth),
  });
  const response = await auth.api.signOut({
    asResponse: true,
    headers: request.headers,
  });
  const headers = new Headers(response.headers);

  return redirectDocument(buildLocalizedPath(locale, "/login", supportedLocaleCodes), {
    headers,
  });
}
