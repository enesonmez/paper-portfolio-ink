import { describe, expect, it, vi } from "vitest";

import { accounts, users } from "#db/schema";

function readUpdatedValues(setMock: ReturnType<typeof vi.fn>) {
  return setMock.mock.calls[0]?.[0] as Record<string, unknown>;
}

describe("users server helpers", () => {
  it("does not bump authzVersion when only profile fields change", async () => {
    const selectLimitMock = vi.fn().mockResolvedValue([
      {
        email: "author@example.com",
        id: "user-author",
        isActive: true,
        role: "author",
      },
    ]);
    const selectWhereMock = vi.fn().mockReturnValue({
      limit: selectLimitMock,
    });
    const selectFromMock = vi.fn().mockReturnValue({
      where: selectWhereMock,
    });
    const selectMock = vi.fn().mockReturnValue({
      from: selectFromMock,
    });
    const updateWhereMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockReturnValue({
      where: updateWhereMock,
    });
    const updateMock = vi.fn().mockImplementation((table) => {
      if (table === users) {
        return {
          set: setMock,
        };
      }

      if (table === accounts) {
        return {
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        };
      }

      throw new Error("Unexpected table");
    });
    const db = {
      select: selectMock,
      update: updateMock,
    } as unknown;
    const { updateUser } = await import("~/lib/users/users.server");

    await updateUser(db as never, "user-author", {
      avatarUrl: "",
      bio: "Updated bio",
      displayName: "Updated Author",
      email: "author@example.com",
      isActive: true,
      password: "",
      role: "author",
    });

    expect(readUpdatedValues(setMock)).not.toHaveProperty("authzVersion");
  });

  it("bumps authzVersion when isActive changes", async () => {
    const selectLimitMock = vi.fn().mockResolvedValue([
      {
        email: "author@example.com",
        id: "user-author",
        isActive: true,
        role: "author",
      },
    ]);
    const selectWhereMock = vi.fn().mockReturnValue({
      limit: selectLimitMock,
    });
    const selectFromMock = vi.fn().mockReturnValue({
      where: selectWhereMock,
    });
    const selectMock = vi.fn().mockReturnValue({
      from: selectFromMock,
    });
    const updateWhereMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockReturnValue({
      where: updateWhereMock,
    });
    const updateMock = vi.fn().mockImplementation((table) => {
      if (table === users) {
        return {
          set: setMock,
        };
      }

      if (table === accounts) {
        return {
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        };
      }

      throw new Error("Unexpected table");
    });
    const db = {
      select: selectMock,
      update: updateMock,
    } as unknown;
    const { updateUser } = await import("~/lib/users/users.server");

    await updateUser(db as never, "user-author", {
      avatarUrl: "",
      bio: "Updated bio",
      displayName: "Updated Author",
      email: "author@example.com",
      isActive: false,
      password: "",
      role: "author",
    });

    expect(readUpdatedValues(setMock)).toHaveProperty("authzVersion");
  });

  it("bumps authzVersion when role changes", async () => {
    const selectLimitMock = vi.fn().mockResolvedValue([
      {
        email: "author@example.com",
        id: "user-author",
        isActive: true,
        role: "author",
      },
    ]);
    const selectWhereMock = vi.fn().mockReturnValue({
      limit: selectLimitMock,
    });
    const selectFromMock = vi.fn().mockReturnValue({
      where: selectWhereMock,
    });
    const selectMock = vi.fn().mockReturnValue({
      from: selectFromMock,
    });
    const updateWhereMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockReturnValue({
      where: updateWhereMock,
    });
    const updateMock = vi.fn().mockImplementation((table) => {
      if (table === users) {
        return {
          set: setMock,
        };
      }

      if (table === accounts) {
        return {
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        };
      }

      throw new Error("Unexpected table");
    });
    const db = {
      select: selectMock,
      update: updateMock,
    } as unknown;
    const { updateUser } = await import("~/lib/users/users.server");

    await updateUser(db as never, "user-author", {
      avatarUrl: "",
      bio: "Updated bio",
      displayName: "Updated Author",
      email: "author@example.com",
      isActive: true,
      password: "",
      role: "admin",
    });

    expect(readUpdatedValues(setMock)).toHaveProperty("authzVersion");
  });
});
