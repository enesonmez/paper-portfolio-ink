import type { AnalyticsRuntimeConfig } from "./config";

type AnalyticsServerEnvName = "ANALYTICS_SECRET" | "AUTH_SECRET" | "BETTER_AUTH_SECRET";

function readServerEnv(name: AnalyticsServerEnvName) {
  const processObject = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return processObject.process?.env?.[name];
}

export function resolveAnalyticsConfig(
  override?: Partial<AnalyticsRuntimeConfig>,
): AnalyticsRuntimeConfig {
  const secret =
    override?.secret ??
    readServerEnv("ANALYTICS_SECRET") ??
    readServerEnv("BETTER_AUTH_SECRET") ??
    readServerEnv("AUTH_SECRET");

  if (!secret) {
    throw new Error(
      "Missing analytics secret. Provide ANALYTICS_SECRET or reuse the auth secret before starting the app.",
    );
  }

  return {
    secret,
  };
}
