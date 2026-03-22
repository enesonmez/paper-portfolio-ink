import type { AuthorizationClaim } from "./model";

export interface AuthorizationActor {
  authzVersion: number;
  claims: AuthorizationClaim[];
  role: string | null;
  userId: string | null;
}

export interface DashboardActorSession {
  actor: AuthorizationActor;
  sessionUser: Record<string, unknown>;
}
