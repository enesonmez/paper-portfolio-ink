import type { AppLoadContext } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { configurationParameters } from "#db/schema";

const { invalidateCachedDataMock, loadCachedDataMock } = vi.hoisted(() => ({
  invalidateCachedDataMock: vi.fn(),
  loadCachedDataMock: vi.fn(),
}));

vi.mock("~/shared/cache/data-cache.server", () => ({
  invalidateCachedData: invalidateCachedDataMock,
  loadCachedData: loadCachedDataMock,
}));

describe("configuration cache service", () => {
  const context = {
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    invalidateCachedDataMock.mockReset();
    loadCachedDataMock.mockReset();
  });

  it("loads account configuration through the typed cache and memoizes per request", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/dashboard");
    loadCachedDataMock.mockResolvedValue({
      "contact.email": "admin@paper-portfolio-ink.dev",
      "site.domainUrl": "https://paper-portfolio-ink.dev",
      "site.name": "Paper Ink",
      "social.github": "https://github.com/enesonmez",
      "social.instagram": "https://instagram.com/paperportfolioink",
      "social.linkedin": "https://linkedin.com/in/enes-ink",
      "social.x": "https://x.com/paperinkdev",
    });

    const { loadAccountConfigurationParameters } =
      await import("~/lib/configuration/configuration.server");

    const first = await loadAccountConfigurationParameters(context, request);
    const second = await loadAccountConfigurationParameters(context, request);

    expect(first["site.name"]).toBe("Paper Ink");
    expect(second).toBe(first);
    expect(loadCachedDataMock).toHaveBeenCalledTimes(1);
    expect(loadCachedDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        context,
        key: "https://paper-portfolio-ink.dev/__cache/configuration/parameters",
      }),
    );
  });

  it("invalidates the configuration cache with the request-scoped cache key", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/dashboard");
    const { purgeAccountConfigurationCache } =
      await import("~/lib/configuration/configuration.server");

    await purgeAccountConfigurationCache(context, request);

    expect(invalidateCachedDataMock).toHaveBeenCalledWith(
      context,
      "https://paper-portfolio-ink.dev/__cache/configuration/parameters",
    );
  });

  it("persists account configuration updates with a single conflict-aware upsert", async () => {
    const onConflictDoUpdateMock = vi.fn().mockResolvedValue(undefined);
    const valuesMock = vi.fn().mockReturnValue({
      onConflictDoUpdate: onConflictDoUpdateMock,
    });
    const insertMock = vi.fn().mockReturnValue({
      values: valuesMock,
    });
    const db = {
      insert: insertMock,
    } as unknown;
    const { updateAccountConfigurationParameter } =
      await import("~/lib/configuration/configuration.server");

    await updateAccountConfigurationParameter(db as never, {
      key: "site.name",
      value: "Paper Portfolio Ink",
    });

    expect(insertMock).toHaveBeenCalledWith(configurationParameters);
    expect(valuesMock).toHaveBeenCalledWith({
      key: "site.name",
      value: "Paper Portfolio Ink",
    });
    expect(onConflictDoUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: configurationParameters.key,
      }),
    );
  });
});
