interface SessionUserRecord {
  authzVersion?: unknown;
  claims?: unknown;
  displayName?: unknown;
  email?: unknown;
  id?: unknown;
  isActive?: unknown;
  name?: unknown;
  role?: unknown;
}

function resolveSessionUser(input: unknown): SessionUserRecord | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  if ("user" in input) {
    const user = (input as { user?: unknown }).user;

    return typeof user === "object" && user !== null
      ? (user as SessionUserRecord)
      : null;
  }

  return input as SessionUserRecord;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function getSessionUserSnapshot(input: unknown) {
  return { ...(resolveSessionUser(input) ?? {}) } satisfies SessionUserRecord;
}

export function getSessionUserId(input: unknown) {
  return readString(resolveSessionUser(input)?.id);
}

export function getSessionUserRole(input: unknown) {
  return readString(resolveSessionUser(input)?.role);
}

export function getSessionUserAuthzVersion(input: unknown) {
  return readInteger(resolveSessionUser(input)?.authzVersion) ?? 1;
}

export function getAuthorizationClaimSet(input: unknown) {
  const claims = resolveSessionUser(input)?.claims;

  if (!Array.isArray(claims)) {
    return [];
  }

  return claims.filter(
    (claim): claim is string => typeof claim === "string" && claim.trim().length > 0,
  );
}

export function isSessionUserActive(input: unknown) {
  const value = resolveSessionUser(input)?.isActive;

  return typeof value === "boolean" ? value : true;
}

export function isSessionUserAdmin(input: unknown) {
  return getSessionUserRole(input) === "admin";
}
