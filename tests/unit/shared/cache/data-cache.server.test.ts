import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  createCloudflareDataCache,
  createMemoryDataCache,
  getAppDataCache,
  loadCachedData,
} from "~/shared/cache/data-cache.server";

const payloadSchema = z.object({
  value: z.string(),
});

describe("data cache server", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves payloads through the memory cache adapter", async () => {
    const cache = createMemoryDataCache(new Map());

    await cache.set(
      "https://paper-portfolio-ink.dev/__cache/test",
      { value: "cached" },
      {
        maxAgeSeconds: 60,
      },
    );

    await expect(
      cache.get("https://paper-portfolio-ink.dev/__cache/test", payloadSchema),
    ).resolves.toEqual({
      value: "cached",
    });
  });

  it("expires memory cache entries after their ttl", async () => {
    vi.useFakeTimers();

    const cache = createMemoryDataCache(new Map());

    await cache.set(
      "https://paper-portfolio-ink.dev/__cache/test",
      { value: "cached" },
      {
        maxAgeSeconds: 10,
      },
    );

    vi.advanceTimersByTime(10_001);

    await expect(
      cache.get("https://paper-portfolio-ink.dev/__cache/test", payloadSchema),
    ).resolves.toBeNull();
  });

  it("stores and retrieves payloads through the cloudflare cache adapter", async () => {
    const store = new Map<
      string,
      {
        cacheControl: string;
        value: string;
      }
    >();
    const cache = createCloudflareDataCache({
      delete: vi.fn((key: string) => {
        return Promise.resolve(store.delete(key));
      }),
      get: vi.fn((key: string) => {
        return Promise.resolve(store.get(key)?.value ?? null);
      }),
      set: vi.fn((key: string, value: string, cacheControl: string) => {
        store.set(key, {
          cacheControl,
          value,
        });

        return Promise.resolve();
      }),
    });

    await cache.set(
      "https://paper-portfolio-ink.dev/__cache/test",
      { value: "edge" },
      {
        maxAgeSeconds: 60,
        staleWhileRevalidateSeconds: 300,
      },
    );

    await expect(
      cache.get("https://paper-portfolio-ink.dev/__cache/test", payloadSchema),
    ).resolves.toEqual({
      value: "edge",
    });
  });

  it("falls back to the shared node cache when the runtime is node", async () => {
    const loadMock = vi.fn(() => Promise.resolve({ value: "portable" }));
    const context = {
      runtime: {
        platform: "node" as const,
      },
    };

    const firstValue = await loadCachedData({
      context,
      key: "https://paper-portfolio-ink.dev/__cache/test",
      load: loadMock,
      options: {
        maxAgeSeconds: 60,
      },
      schema: payloadSchema,
    });
    const secondValue = await loadCachedData({
      context,
      key: "https://paper-portfolio-ink.dev/__cache/test",
      load: loadMock,
      options: {
        maxAgeSeconds: 60,
      },
      schema: payloadSchema,
    });

    expect(getAppDataCache(context)).toBe(getAppDataCache(context));
    expect(firstValue).toEqual({ value: "portable" });
    expect(secondValue).toEqual({ value: "portable" });
    expect(loadMock).toHaveBeenCalledTimes(1);
  });
});
