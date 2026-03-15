import type { AppLoadContext } from "react-router";
import { redirect } from "react-router";

import { resolveAuthConfig } from "./auth-config.server";
import { getSessionFromRequest } from "./auth.server";

interface RequireSessionOptions {
  redirectTo?: string;
}

export async function requireSession(
  request: Request,
  context: AppLoadContext,
  options: RequireSessionOptions = {},
) {
  const session = await getSessionFromRequest(request, {
    db: context.db,
    ...resolveAuthConfig(request, context.auth),
  });

  if (!session) {
    return redirect(options.redirectTo ?? "/");
  }

  return session;
}
