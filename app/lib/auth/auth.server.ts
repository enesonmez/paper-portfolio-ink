import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { AppDb } from "../../../db";
import { schema } from "../../../db/schema";
import type { AuthRuntimeConfig } from "./auth-config";

interface CreateAuthOptions extends AuthRuntimeConfig {
  db: AppDb;
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
