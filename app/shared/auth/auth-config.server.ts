import type { AuthRuntimeConfig } from "./auth-config";

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
  const secret = override?.secret ?? envSecret;

  if (!secret) {
    throw new Error(
      "Missing auth secret. Provide BETTER_AUTH_SECRET or AUTH_SECRET before starting the app.",
    );
  }

  return {
    baseURL,
    secret,
    trustedOrigins: override?.trustedOrigins ?? [baseURL],
  };
}
