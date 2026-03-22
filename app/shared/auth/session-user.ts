interface SessionUserRecord {
  id?: unknown;
  isActive?: unknown;
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

export function getSessionUserId(input: unknown) {
  return readString(resolveSessionUser(input)?.id);
}

export function getSessionUserRole(input: unknown) {
  return readString(resolveSessionUser(input)?.role);
}

export function isSessionUserActive(input: unknown) {
  const value = resolveSessionUser(input)?.isActive;

  return typeof value === "boolean" ? value : true;
}

export function isSessionUserAdmin(input: unknown) {
  return getSessionUserRole(input) === "admin";
}
