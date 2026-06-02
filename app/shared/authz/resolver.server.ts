import { asc, eq, sql } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import { z } from "zod";

import { getDbFromContext } from "../../../db/context";
import {
  authorizationState,
  authorizationRoleClaims,
  authorizationUserClaimOverrides,
} from "../../../db/schema";
import { loadCachedData } from "~/shared/cache/data-cache.server";
import { buildLoginRedirect } from "~/shared/auth/login.server";
import { requireSession } from "~/shared/auth/session.server";
import {
  getAuthorizationClaimSet,
  getSessionUserAuthzVersion,
  getSessionUserId,
  getSessionUserRole,
  getSessionUserSnapshot,
} from "~/shared/auth/session-user";

import {
  AUTHORIZATION_CLAIM_VALUES,
  AUTHORIZATION_EFFECT,
  getDefaultClaimsForRole,
  isAuthorizationClaim,
  isAuthorizationEffect,
  isUserRole,
  type AuthorizationClaim,
  type AuthorizationEffect,
} from "./model";
import type { AuthorizationActor, DashboardActorSession } from "./actor";

const authorizationClaimsSchema = z.array(z.enum(AUTHORIZATION_CLAIM_VALUES));
const authorizationActorRequestCache = new WeakMap<
  Request,
  Promise<AuthorizationActor>
>();

interface EffectiveClaimOverride {
  claimKey: AuthorizationClaim;
  effect: AuthorizationEffect;
}

function buildAuthorizationCacheKey(args: {
  authzVersion: number;
  request: Request;
  revision: number;
  role: string;
  userId: string;
}) {
  return new URL(
    `/__cache/authz/${args.userId}/${args.role}/${args.authzVersion}/${args.revision}`,
    args.request.url,
  ).toString();
}

function sortAuthorizationClaims(claims: Iterable<AuthorizationClaim>) {
  const claimSet = new Set(claims);

  return AUTHORIZATION_CLAIM_VALUES.filter((claim) => claimSet.has(claim));
}

function normalizeAuthorizationClaims(claims: Iterable<string>) {
  return sortAuthorizationClaims(
    Array.from(claims).filter((claim): claim is AuthorizationClaim =>
      isAuthorizationClaim(claim),
    ),
  );
}

function applyClaimOverrides(
  baseClaims: readonly AuthorizationClaim[],
  overrides: readonly EffectiveClaimOverride[],
) {
  const effectiveClaims = new Set<AuthorizationClaim>(baseClaims);

  for (const override of overrides) {
    if (override.effect === AUTHORIZATION_EFFECT.grant) {
      effectiveClaims.add(override.claimKey);
      continue;
    }

    effectiveClaims.delete(override.claimKey);
  }

  return sortAuthorizationClaims(effectiveClaims);
}

async function listRoleClaims(context: AppLoadContext, role: string) {
  const db = getDbFromContext(context);

  if (!("select" in db) || typeof db.select !== "function" || !isUserRole(role)) {
    return [];
  }

  const rows = await db
    .select({
      claimKey: authorizationRoleClaims.claimKey,
    })
    .from(authorizationRoleClaims)
    .where(eq(authorizationRoleClaims.role, role))
    .orderBy(asc(authorizationRoleClaims.claimKey));

  return normalizeAuthorizationClaims(rows.map((row) => row.claimKey));
}

async function listUserClaimOverrides(context: AppLoadContext, userId: string) {
  const db = getDbFromContext(context);

  if (!("select" in db) || typeof db.select !== "function") {
    return [];
  }

  const rows = await db
    .select({
      claimKey: authorizationUserClaimOverrides.claimKey,
      effect: authorizationUserClaimOverrides.effect,
    })
    .from(authorizationUserClaimOverrides)
    .where(eq(authorizationUserClaimOverrides.userId, userId))
    .orderBy(asc(authorizationUserClaimOverrides.claimKey));

  return rows.flatMap((row) => {
    if (!isAuthorizationClaim(row.claimKey) || !isAuthorizationEffect(row.effect)) {
      return [];
    }

    return [
      {
        claimKey: row.claimKey,
        effect: row.effect,
      },
    ] satisfies EffectiveClaimOverride[];
  });
}

async function loadEffectiveClaimsFromDb(
  context: AppLoadContext,
  userId: string,
  role: string,
) {
  const [roleClaims, overrides] = await Promise.all([
    listRoleClaims(context, role),
    listUserClaimOverrides(context, userId),
  ]);

  return applyClaimOverrides(roleClaims, overrides);
}

async function loadAuthorizationRevision(context: AppLoadContext) {
  const db = getDbFromContext(context);

  if (!("select" in db) || typeof db.select !== "function") {
    return null;
  }

  try {
    const rows = await db
      .select({
        revision: authorizationState.revision,
      })
      .from(authorizationState)
      .where(eq(authorizationState.key, "global"));

    const revision = rows[0]?.revision;

    return typeof revision === "number" && revision >= 1 ? revision : null;
  } catch {
    return null;
  }
}

export async function getAuthorizationRevision(context: AppLoadContext) {
  return loadAuthorizationRevision(context);
}

async function loadEffectiveClaims(
  context: AppLoadContext,
  request: Request,
  userId: string,
  role: string,
  authzVersion: number,
) {
  const db = getDbFromContext(context);

  if (!("select" in db) || typeof db.select !== "function") {
    return isUserRole(role) ? [...getDefaultClaimsForRole(role)] : [];
  }

  const revision = await loadAuthorizationRevision(context);

  if (revision === null) {
    return loadEffectiveClaimsFromDb(context, userId, role);
  }

  return loadCachedData({
    context,
    key: buildAuthorizationCacheKey({
      authzVersion,
      request,
      revision,
      role,
      userId,
    }),
    load: () => loadEffectiveClaimsFromDb(context, userId, role),
    options: {
      maxAgeSeconds: 60 * 10,
      staleWhileRevalidateSeconds: 60 * 60,
    },
    schema: authorizationClaimsSchema,
  });
}

export async function warmAuthorizationActorClaimsCache(args: {
  authzVersion: number;
  context: AppLoadContext;
  request: Request;
  role: string;
  userId: string;
}) {
  await loadEffectiveClaims(
    args.context,
    args.request,
    args.userId,
    args.role,
    args.authzVersion,
  );
}

export async function bumpAuthorizationRevision(context: AppLoadContext) {
  const db = getDbFromContext(context);

  if (!("update" in db) || typeof db.update !== "function") {
    return null;
  }

  await db
    .update(authorizationState)
    .set({
      revision: sql`${authorizationState.revision} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(authorizationState.key, "global"));

  return loadAuthorizationRevision(context);
}

function buildAuthorizationActor(args: {
  authzVersion: number;
  claims: readonly AuthorizationClaim[];
  role: string | null;
  userId: string | null;
}) {
  return {
    authzVersion: args.authzVersion,
    claims: [...args.claims],
    role: args.role,
    userId: args.userId,
  } satisfies AuthorizationActor;
}

export async function getAuthorizationActorFromSession(
  context: AppLoadContext,
  request: Request,
  session: unknown,
) {
  const cachedPromise = authorizationActorRequestCache.get(request);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = (async () => {
    const db = getDbFromContext(context);
    const dbCanResolveClaims = "select" in db && typeof db.select === "function";
    const userId = getSessionUserId(session);
    const role = getSessionUserRole(session);
    const authzVersion = getSessionUserAuthzVersion(session);
    const explicitClaims = getAuthorizationClaimSet(session);

    if (!dbCanResolveClaims && explicitClaims.length > 0) {
      return buildAuthorizationActor({
        authzVersion,
        claims: normalizeAuthorizationClaims(explicitClaims),
        role,
        userId,
      });
    }

    if (!userId || !role) {
      return buildAuthorizationActor({
        authzVersion,
        claims: [],
        role,
        userId,
      });
    }

    return buildAuthorizationActor({
      authzVersion,
      claims: await loadEffectiveClaims(context, request, userId, role, authzVersion),
      role,
      userId,
    });
  })();

  authorizationActorRequestCache.set(request, promise);

  return promise;
}

export async function requireDashboardActor(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardActorSession | Response> {
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });

  if (session instanceof Response) {
    return session;
  }

  return {
    actor: await getAuthorizationActorFromSession(context, request, session),
    sessionUser: getSessionUserSnapshot(session),
  };
}
