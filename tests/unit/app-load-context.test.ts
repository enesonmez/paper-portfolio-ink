import { describe, expect, it } from "vitest";

import { getAppDataCache } from "../../app/shared/cache/data-cache.server";
import { createRuntimeContext } from "../../app/runtime.server";
import type { AppDb } from "../../db";
import { getDbFromContext } from "../../db/context";

describe("app load context", () => {
  it("reads the database from a runtime-agnostic route context", () => {
    const db = { select: () => null } as unknown as AppDb;

    expect(getDbFromContext({ db })).toBe(db);
  });

  it("creates portable runtime metadata without vendor-specific bindings", () => {
    expect(createRuntimeContext("cloudflare")).toEqual({
      platform: "cloudflare",
    });
    expect(createRuntimeContext("node")).toEqual({
      platform: "node",
    });
  });

  it("returns a shared cache adapter for node runtimes", () => {
    const firstCache = getAppDataCache({
      runtime: createRuntimeContext("node"),
    });
    const secondCache = getAppDataCache({
      runtime: createRuntimeContext("node"),
    });

    expect(firstCache).toBe(secondCache);
  });
});
