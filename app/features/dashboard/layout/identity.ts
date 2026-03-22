export interface DashboardIdentity {
  id: string | null;
  displayName: string;
  email: string;
  initials: string;
  role: string;
}

export type DashboardIdentitySource = Partial<
  Record<"displayName" | "email" | "id" | "name" | "role", unknown>
>;

export interface DashboardLayoutOutletContext {
  user: DashboardIdentity;
}

const DASHBOARD_IDENTITY_FALLBACK = {
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

export function buildDashboardIdentity(
  source: DashboardIdentitySource,
): DashboardIdentity {
  const id = readString(source.id) ?? null;
  const displayName =
    readString(source.displayName) ??
    readString(source.name) ??
    readString(source.email) ??
    DASHBOARD_IDENTITY_FALLBACK.displayName;
  const email = readString(source.email) ?? DASHBOARD_IDENTITY_FALLBACK.email;
  const role = readString(source.role) ?? DASHBOARD_IDENTITY_FALLBACK.role;

  return {
    id,
    displayName,
    email,
    initials: buildInitials(displayName),
    role,
  };
}
