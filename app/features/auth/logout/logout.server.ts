import { redirect, redirectDocument, type AppLoadContext } from "react-router";

import { resolveAuthConfig } from "~/lib/auth/auth-config.server";
import { createAuth } from "~/lib/auth/auth.server";

export function redirectLoggedOutUsers(_request: Request) {
  return redirect("/login");
}

interface PerformLogoutOptions {
  context: AppLoadContext;
  request: Request;
}

export async function performLogout({ context, request }: PerformLogoutOptions) {
  const auth = createAuth({
    db: context.db,
    ...resolveAuthConfig(request, context.auth),
  });
  const response = await auth.api.signOut({
    asResponse: true,
    headers: request.headers,
  });
  const headers = new Headers(response.headers);

  return redirectDocument("/login", {
    headers,
  });
}
