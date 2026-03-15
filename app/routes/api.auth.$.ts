import type { Route } from "./+types/api.auth.$";

import { resolveAuthConfig } from "../lib/auth/auth-config.server";
import { createAuth } from "../lib/auth/auth.server";

function getAuthFromContext(request: Request, context: Route.LoaderArgs["context"]) {
  const authConfig = resolveAuthConfig(request, context.auth);

  return createAuth({
    db: context.db,
    ...authConfig,
  });
}

export function loader({ context, request }: Route.LoaderArgs) {
  return getAuthFromContext(request, context).handler(request);
}

export function action({ context, request }: Route.ActionArgs) {
  return getAuthFromContext(request, context).handler(request);
}
