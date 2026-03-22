import type { AuthorizationClaim } from "~/shared/authz/model";

export interface DashboardIdentity {
  claims: readonly AuthorizationClaim[];
  id: string | null;
  displayName: string;
  email: string;
  initials: string;
  role: string;
}

export type DashboardIdentitySource = Partial<
  Record<"claims" | "displayName" | "email" | "id" | "name" | "role", unknown>
>;

export interface DashboardLayoutOutletContext {
  user: DashboardIdentity;
}

const DASHBOARD_IDENTITY_FALLBACK = {
  claims: [],
  displayName: "Paper Ink",
  email: "-",
  role: "-",
} as const;

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function buildInitials(source: string) {
  const letters = source
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return letters || "PE";
}

function readClaims(value: unknown): AuthorizationClaim[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (claim): claim is AuthorizationClaim =>
      typeof claim === "string" && claim.trim().length > 0,
  );
}

export function buildDashboardIdentity(
  source: DashboardIdentitySource,
): DashboardIdentity {
  const claims = readClaims(source.claims);
  const id = readString(source.id) ?? null;
  const displayName =
    readString(source.displayName) ??
    readString(source.name) ??
    readString(source.email) ??
    DASHBOARD_IDENTITY_FALLBACK.displayName;
  const email = readString(source.email) ?? DASHBOARD_IDENTITY_FALLBACK.email;
  const role = readString(source.role) ?? DASHBOARD_IDENTITY_FALLBACK.role;

  return {
    claims,
    id,
    displayName,
    email,
    initials: buildInitials(displayName),
    role,
  };
}
