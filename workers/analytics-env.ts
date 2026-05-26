import type { AnalyticsRuntimeConfig } from "../app/shared/analytics/config";

export interface CloudflareAnalyticsEnvBindings {
  ANALYTICS_SECRET?: string;
}

export function resolveCloudflareAnalyticsConfig(
  env: CloudflareAnalyticsEnvBindings,
): Partial<AnalyticsRuntimeConfig> | undefined {
  if (!env.ANALYTICS_SECRET) {
    return undefined;
  }

  return {
    secret: env.ANALYTICS_SECRET,
  };
}
