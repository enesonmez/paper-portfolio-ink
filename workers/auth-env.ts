import type { AuthRuntimeConfig } from "../app/lib/auth/auth-config";

export interface CloudflareAuthEnvBindings {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
}

export function resolveCloudflareAuthConfig(
  env: CloudflareAuthEnvBindings,
  request: Request,
): Partial<AuthRuntimeConfig> | undefined {
  if (!env.BETTER_AUTH_SECRET && !env.BETTER_AUTH_URL) {
    return undefined;
  }

  const baseURL = env.BETTER_AUTH_URL ?? new URL(request.url).origin;

  return {
    baseURL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [baseURL],
  };
}
