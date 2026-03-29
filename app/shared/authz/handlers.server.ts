import type { AppLoadContext } from "react-router";

import { buildAuthorizationError } from "~/shared/errors/builders.server";
import type {
  AppErrorAction,
  AppErrorCode,
  AppErrorResource,
} from "~/shared/errors/contracts";

import type { DashboardActorSession } from "./actor";
import { actorHasAnyClaim, actorHasClaim } from "./guards";
import type { AuthorizationClaim } from "./model";
import { requireDashboardActor } from "./resolver.server";

interface AuthorizationFailureOptions<TResponseData> {
  action: AppErrorAction;
  code: AppErrorCode;
  details?: Record<string, unknown>;
  message: string;
  resource: AppErrorResource;
  responseData?: TResponseData;
  status?: number;
  targetId?: string | null;
  targetLabel?: string | null;
}

export async function withDashboardAccess<T>(args: {
  request: Request;
  context: AppLoadContext;
  authorize?: (auth: DashboardActorSession) => Promise<void> | void;
  handle: (auth: DashboardActorSession) => Promise<Response | T> | Response | T;
}): Promise<Response | T> {
  const auth = await requireDashboardActor(args.context, args.request);

  if (auth instanceof Response) {
    return auth;
  }

  await args.authorize?.(auth);

  return args.handle(auth);
}

export function assertAuthorized<TResponseData>(args: {
  error: AuthorizationFailureOptions<TResponseData>;
  isAllowed: boolean;
}) {
  if (args.isAllowed) {
    return;
  }

  throw buildAuthorizationError(args.error);
}

export function assertClaimAuthorized<TResponseData>(args: {
  actor: DashboardActorSession["actor"];
  claim: AuthorizationClaim;
  error: AuthorizationFailureOptions<TResponseData>;
}) {
  assertAuthorized({
    error: args.error,
    isAllowed: actorHasClaim(args.actor, args.claim),
  });
}

export function assertAnyClaimAuthorized<TResponseData>(args: {
  actor: DashboardActorSession["actor"];
  claims: readonly AuthorizationClaim[];
  error: AuthorizationFailureOptions<TResponseData>;
}) {
  assertAuthorized({
    error: args.error,
    isAllowed: actorHasAnyClaim(args.actor, args.claims),
  });
}
