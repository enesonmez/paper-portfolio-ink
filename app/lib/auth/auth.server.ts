import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { AppDb } from "../../../db";
import { schema } from "../../../db/schema";
import type { AuthRuntimeConfig } from "./auth-config";

const DEV_AUTH_SECRET = "dev-only-better-auth-secret";

interface CreateAuthOptions extends AuthRuntimeConfig {
  db: AppDb;
}

export function resolveAuthConfig(
  request: Request,
  override?: Partial<AuthRuntimeConfig>,
): AuthRuntimeConfig {
  const origin = new URL(request.url).origin;
  const baseURL = override?.baseURL ?? origin;

  return {
    baseURL,
    secret: override?.secret ?? DEV_AUTH_SECRET,
    trustedOrigins: override?.trustedOrigins ?? [baseURL],
  };
}

export function createAuth({ db, secret, baseURL, trustedOrigins }: CreateAuthOptions) {
  return betterAuth({
    baseURL,
    secret,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    user: {
      modelName: "users",
      fields: {
        name: "display_name",
        image: "avatar_url",
      },
    },
    session: {
      modelName: "sessions",
      fields: {
        userId: "user_id",
      },
    },
    account: {
      modelName: "accounts",
      fields: {
        userId: "user_id",
        accountId: "account_id",
        providerId: "provider_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
      },
    },
    verification: {
      modelName: "verifications",
    },
  });
}

export async function getSessionFromRequest(
  request: Request,
  options: CreateAuthOptions,
) {
  const auth = createAuth(options);

  return auth.api.getSession({
    headers: request.headers,
  });
}
