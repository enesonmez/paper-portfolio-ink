import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAppDb } from "../../db";
import { schema } from "../../db/schema";
import { createD1Db, d1Provider } from "../../db/providers/d1";

const { drizzleMock } = vi.hoisted(() => {
  return {
    drizzleMock: vi.fn(),
  };
});

vi.mock("drizzle-orm/d1", () => {
  return {
    drizzle: drizzleMock,
  };
});

describe("database provider", () => {
  beforeEach(() => {
    drizzleMock.mockReset();
  });

  it("creates a drizzle instance from a D1 binding through the provider adapter", () => {
    const binding = { prepare: vi.fn() } as unknown as D1Database;
    const dbInstance = { query: {} };

    drizzleMock.mockReturnValue(dbInstance);

    expect(createD1Db(binding)).toBe(dbInstance);
    expect(drizzleMock).toHaveBeenCalledWith(binding, {
      casing: "snake_case",
      schema,
    });
  });

  it("uses the active provider from the shared database entrypoint", () => {
    const binding = { prepare: vi.fn() } as unknown as D1Database;
    const dbInstance = { select: vi.fn() };
    const env = { DB: binding };

    drizzleMock.mockReturnValue(dbInstance);

    expect(createAppDb(env)).toBe(dbInstance);
    expect(d1Provider.createDb(env)).toBe(dbInstance);
    expect(drizzleMock).toHaveBeenCalledTimes(2);
  });
});
