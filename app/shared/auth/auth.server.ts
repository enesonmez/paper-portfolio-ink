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
        name: "displayName",
        image: "avatarUrl",
      },
      additionalFields: {
        isActive: {
          type: "boolean",
          input: false,
          required: false,
        },
        role: {
          type: "string",
          input: false,
          required: false,
        },
      },
    },
    session: {
      modelName: "sessions",
    },
    account: {
      modelName: "accounts",
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
