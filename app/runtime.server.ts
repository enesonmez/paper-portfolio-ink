export type AppPlatform = "cloudflare" | "node";

export interface AppRuntimeContext {
  platform: AppPlatform;
}

export function createRuntimeContext(platform: AppPlatform): AppRuntimeContext {
  return { platform };
}
