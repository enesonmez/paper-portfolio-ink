import type { AuthRuntimeConfig } from "./auth-config";

const DEV_AUTH_SECRET = "paper-enes-ink-dev-secret-0123456789";

type AuthServerEnvName = "AUTH_SECRET" | "BETTER_AUTH_SECRET" | "BETTER_AUTH_URL";

function readServerEnv(name: AuthServerEnvName) {
  const processObject = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return processObject.process?.env?.[name];
}

export function resolveAuthConfig(
  request: Request,
  override?: Partial<AuthRuntimeConfig>,
): AuthRuntimeConfig {
  const origin = new URL(request.url).origin;
  const baseURL = override?.baseURL ?? readServerEnv("BETTER_AUTH_URL") ?? origin;
  const envSecret = readServerEnv("BETTER_AUTH_SECRET") ?? readServerEnv("AUTH_SECRET");

  return {
    baseURL,
    secret: override?.secret ?? envSecret ?? DEV_AUTH_SECRET,
    trustedOrigins: override?.trustedOrigins ?? [baseURL],
  };
}
