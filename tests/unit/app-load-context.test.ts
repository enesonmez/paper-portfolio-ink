import { describe, expect, it } from "vitest";

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
});
