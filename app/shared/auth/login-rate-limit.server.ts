import { and, eq } from "drizzle-orm";

import type { AppDb } from "../../../db";
import { loginRateLimits } from "../../../db/schema";
import type { LoginSubmission } from "~/shared/auth/login.server";
import type { LoginFormState } from "~/shared/auth/login.shared";
import { buildAuthorizationError } from "~/shared/errors/builders.server";
import { isAppError } from "~/shared/errors/app-error.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

const textEncoder = new TextEncoder();

export const LOGIN_RATE_LIMIT_SCOPE = {
  email: "email",
  ip: "ip",
} as const;

type LoginRateLimitScope =
  (typeof LOGIN_RATE_LIMIT_SCOPE)[keyof typeof LOGIN_RATE_LIMIT_SCOPE];

interface LoginRateLimitPolicy {
  blockMs: number;
  maxFailures: number;
  windowMs: number;
}

const LOGIN_RATE_LIMIT_POLICIES: Record<LoginRateLimitScope, LoginRateLimitPolicy> = {
  email: {
    blockMs: 15 * 60 * 1000,
    maxFailures: 5,
    windowMs: 15 * 60 * 1000,
  },
  ip: {
    blockMs: 15 * 60 * 1000,
    maxFailures: 10,
    windowMs: 15 * 60 * 1000,
  },
};

interface LoginRateLimitIdentifier {
  hash: string;
  scope: LoginRateLimitScope;
}

export interface LoginRateLimitState {
  blockedUntil: Date | null;
  failureCount: number;
  windowStartedAt: Date;
}

function buildLoginRateLimitState(row: {
  blockedUntil: Date | null;
  failureCount: number;
  windowStartedAt: Date;
}): LoginRateLimitState {
  return {
    blockedUntil: row.blockedUntil,
    failureCount: row.failureCount,
    windowStartedAt: row.windowStartedAt,
  };
}

function buildRateLimitError(
  submission: LoginSubmission,
  t: I18nTranslator,
): ReturnType<typeof buildAuthorizationError<LoginFormState>> {
  return buildAuthorizationError<LoginFormState>({
    action: APP_ERROR_ACTION.login,
    code: APP_ERROR_CODE.auth.login.rateLimited,
    details: {
      email: submission.email,
    },
    message: "Login blocked by rate limiting policy",
    resource: APP_ERROR_RESOURCE.authLogin,
    responseData: {
      errors: {
        form: t("validation.login.rateLimited"),
      },
      values: {
        email: submission.email,
        redirectTo: submission.redirectTo,
      },
    },
    status: 429,
  });
}

function extractClientIp(request: Request) {
  const headerCandidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  ];

  for (const candidate of headerCandidates) {
    if (candidate && candidate.length > 0) {
      return candidate;
    }
  }

  return null;
}

async function hashIdentifier(
  secret: string,
  scope: LoginRateLimitScope,
  value: string,
) {
  const normalizedValue = value.trim().toLowerCase();
  const payload = textEncoder.encode(`${scope}:${secret}:${normalizedValue}`);
  const digest = await crypto.subtle.digest("SHA-256", payload);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function buildLoginRateLimitIdentifiers(
  request: Request,
  email: string,
  secret: string,
): Promise<LoginRateLimitIdentifier[]> {
  const identifiers: LoginRateLimitIdentifier[] = [
    {
      hash: await hashIdentifier(secret, LOGIN_RATE_LIMIT_SCOPE.email, email),
      scope: LOGIN_RATE_LIMIT_SCOPE.email,
    },
  ];
  const clientIp = extractClientIp(request);

  if (!clientIp) {
    return identifiers;
  }

  identifiers.push({
    hash: await hashIdentifier(secret, LOGIN_RATE_LIMIT_SCOPE.ip, clientIp),
    scope: LOGIN_RATE_LIMIT_SCOPE.ip,
  });

  return identifiers;
}

function getLoginRateLimitMapKey(identifier: LoginRateLimitIdentifier) {
  return `${identifier.scope}:${identifier.hash}`;
}

async function loadLoginRateLimitStates(
  db: AppDb,
  identifiers: readonly LoginRateLimitIdentifier[],
) {
  const rows = await Promise.all(
    identifiers.map(async (identifier) => {
      const [row] = await db
        .select({
          blockedUntil: loginRateLimits.blockedUntil,
          failureCount: loginRateLimits.failureCount,
          identifierHash: loginRateLimits.identifierHash,
          scope: loginRateLimits.scope,
          windowStartedAt: loginRateLimits.windowStartedAt,
        })
        .from(loginRateLimits)
        .where(
          and(
            eq(loginRateLimits.scope, identifier.scope),
            eq(loginRateLimits.identifierHash, identifier.hash),
          ),
        )
        .limit(1);

      return row
        ? ([
            getLoginRateLimitMapKey(identifier),
            buildLoginRateLimitState(row),
          ] as const)
        : null;
    }),
  );

  return new Map(rows.flatMap((row) => (row ? [row] : [])));
}

export function isLoginRateLimitActive(state: LoginRateLimitState, now: Date) {
  return state.blockedUntil !== null && state.blockedUntil.getTime() > now.getTime();
}

export function resolveNextLoginRateLimitState(
  currentState: LoginRateLimitState | null,
  scope: LoginRateLimitScope,
  now: Date,
): LoginRateLimitState {
  const policy = LOGIN_RATE_LIMIT_POLICIES[scope];

  if (!currentState) {
    return {
      blockedUntil: null,
      failureCount: 1,
      windowStartedAt: now,
    };
  }

  if (isLoginRateLimitActive(currentState, now)) {
    return currentState;
  }

  const isWindowExpired =
    now.getTime() - currentState.windowStartedAt.getTime() >= policy.windowMs;

  if (isWindowExpired) {
    return {
      blockedUntil: null,
      failureCount: 1,
      windowStartedAt: now,
    };
  }

  const failureCount = currentState.failureCount + 1;

  return {
    blockedUntil:
      failureCount >= policy.maxFailures
        ? new Date(now.getTime() + policy.blockMs)
        : null,
    failureCount,
    windowStartedAt: currentState.windowStartedAt,
  };
}

export function shouldTrackLoginRateLimitFailure(error: unknown) {
  if (!isAppError(error)) {
    return false;
  }

  return (
    [
      APP_ERROR_CODE.auth.login.apiError,
      APP_ERROR_CODE.auth.login.inactiveUser,
      APP_ERROR_CODE.auth.login.invalidCredentials,
    ] as const
  ).some((code) => code === error.code);
}

export async function assertLoginRateLimitAllowed(args: {
  db: AppDb;
  request: Request;
  secret: string;
  submission: LoginSubmission;
  t: I18nTranslator;
}) {
  const identifiers = await buildLoginRateLimitIdentifiers(
    args.request,
    args.submission.email,
    args.secret,
  );
  const states = await loadLoginRateLimitStates(args.db, identifiers);
  const now = new Date();

  for (const identifier of identifiers) {
    const state = states.get(getLoginRateLimitMapKey(identifier));

    if (state && isLoginRateLimitActive(state, now)) {
      throw buildRateLimitError(args.submission, args.t);
    }
  }
}

export async function recordLoginRateLimitFailure(args: {
  db: AppDb;
  request: Request;
  secret: string;
  submission: LoginSubmission;
}) {
  const identifiers = await buildLoginRateLimitIdentifiers(
    args.request,
    args.submission.email,
    args.secret,
  );
  const states = await loadLoginRateLimitStates(args.db, identifiers);
  const now = new Date();

  await Promise.all(
    identifiers.map((identifier) => {
      const nextState = resolveNextLoginRateLimitState(
        states.get(getLoginRateLimitMapKey(identifier)) ?? null,
        identifier.scope,
        now,
      );

      return args.db
        .insert(loginRateLimits)
        .values({
          blockedUntil: nextState.blockedUntil,
          failureCount: nextState.failureCount,
          identifierHash: identifier.hash,
          scope: identifier.scope,
          updatedAt: now,
          windowStartedAt: nextState.windowStartedAt,
        })
        .onConflictDoUpdate({
          set: {
            blockedUntil: nextState.blockedUntil,
            failureCount: nextState.failureCount,
            updatedAt: now,
            windowStartedAt: nextState.windowStartedAt,
          },
          target: [loginRateLimits.scope, loginRateLimits.identifierHash],
        });
    }),
  );
}

export async function clearLoginRateLimitFailures(args: {
  db: AppDb;
  request: Request;
  secret: string;
  submission: LoginSubmission;
}) {
  const identifiers = await buildLoginRateLimitIdentifiers(
    args.request,
    args.submission.email,
    args.secret,
  );

  if (identifiers.length === 0) {
    return;
  }

  await Promise.all(
    identifiers.map((identifier) =>
      args.db
        .delete(loginRateLimits)
        .where(
          and(
            eq(loginRateLimits.scope, identifier.scope),
            eq(loginRateLimits.identifierHash, identifier.hash),
          ),
        ),
    ),
  );
}
