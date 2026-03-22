import type { AppLoadContext } from "react-router";
import type * as UserFormServerModule from "~/lib/users/user-form.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cacheDeleteMock,
  cacheGetMock,
  cacheSetMock,
  countActiveAdminsMock,
  createUserMock,
  deactivateUserMock,
  getUserByIdMock,
  isUserEmailTakenMock,
  listUsersMock,
  parseUserFormDataMock,
  requireSessionMock,
  updateUserMock,
} = vi.hoisted(() => {
  return {
    cacheDeleteMock: vi.fn(),
    cacheGetMock: vi.fn(),
    cacheSetMock: vi.fn(),
    countActiveAdminsMock: vi.fn(),
    createUserMock: vi.fn(),
    deactivateUserMock: vi.fn(),
    getUserByIdMock: vi.fn(),
    isUserEmailTakenMock: vi.fn(),
    listUsersMock: vi.fn(),
    parseUserFormDataMock: vi.fn(),
    requireSessionMock: vi.fn(),
    updateUserMock: vi.fn(),
  };
});

vi.mock("~/lib/users/users.server", () => {
  return {
    countActiveAdmins: countActiveAdminsMock,
    createUser: createUserMock,
    deactivateUser: deactivateUserMock,
    getUserById: getUserByIdMock,
    isUserEmailTaken: isUserEmailTakenMock,
    listUsers: listUsersMock,
    updateUser: updateUserMock,
  };
});

vi.mock("~/lib/users/user-form.server", async () => {
  const actual = await vi.importActual<typeof UserFormServerModule>(
    "~/lib/users/user-form.server",
  );

  return {
    ...actual,
    parseUserFormData: parseUserFormDataMock,
  };
});

vi.mock("~/shared/auth/session.server", () => {
  return {
    requireSession: requireSessionMock,
  };
});

describe("dashboard users server", () => {
  const context = {
    cache: {
      delete: cacheDeleteMock,
      get: cacheGetMock,
      set: cacheSetMock,
    },
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    cacheDeleteMock.mockReset();
    cacheGetMock.mockReset();
    cacheSetMock.mockReset();
    countActiveAdminsMock.mockReset();
    createUserMock.mockReset();
    deactivateUserMock.mockReset();
    getUserByIdMock.mockReset();
    isUserEmailTakenMock.mockReset();
    listUsersMock.mockReset();
    parseUserFormDataMock.mockReset();
    requireSessionMock.mockReset();
    updateUserMock.mockReset();
  }, 20000);

  it("loads the users registry for admin sessions", async () => {
    const { loadDashboardUsersData } =
      await import("~/features/dashboard/users/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listUsersMock.mockResolvedValue([
      {
        avatarUrl: null,
        bio: "Platform owner",
        createdAtLabel: "2026-03-20",
        displayName: "Enes Admin",
        email: "admin@example.com",
        id: "user-admin",
        isActive: true,
        role: "admin",
        updatedAtLabel: "2026-03-20",
      },
      {
        avatarUrl: null,
        bio: "Editorial operator",
        createdAtLabel: "2026-03-18",
        displayName: "Ayla Author",
        email: "author@example.com",
        id: "user-author",
        isActive: true,
        role: "author",
        updatedAtLabel: "2026-03-19",
      },
    ]);

    const response = await loadDashboardUsersData(
      context,
      new Request("http://localhost:3000/dashboard/users"),
    );

    if (response instanceof Response) {
      throw new Error("Expected granted users loader data");
    }

    expect(response).toMatchObject({
      access: "granted",
      form: {
        isOpen: false,
        mode: null,
      },
      metrics: {
        adminCount: 1,
        authorCount: 1,
        totalCount: 2,
      },
    });

    if (response.access !== "granted") {
      throw new Error("Expected granted users loader data");
    }

    expect(response.users).toHaveLength(2);
  }, 20000);

  it("does not expose registry data to non-admin sessions", async () => {
    const { loadDashboardUsersData } =
      await import("~/features/dashboard/users/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
      },
    });

    const response = await loadDashboardUsersData(
      context,
      new Request("http://localhost:3000/dashboard/users"),
    );

    if (response instanceof Response) {
      throw new Error("Expected denied users loader data");
    }

    expect(response).toEqual({
      access: "denied",
    });
    expect(listUsersMock).not.toHaveBeenCalled();
  }, 20000);

  it("creates a new user when the session belongs to an admin", async () => {
    const { handleDashboardUsersAction } =
      await import("~/features/dashboard/users/server");

    const request = new Request("http://localhost:3000/dashboard/users", {
      body: new URLSearchParams({
        displayName: "Ayla Author",
        email: "author@example.com",
        intent: "create",
        password: "PaperInk1234!",
        role: "author",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    parseUserFormDataMock.mockReturnValue({
      data: {
        avatarUrl: "",
        bio: "",
        displayName: "Ayla Author",
        email: "author@example.com",
        isActive: true,
        password: "PaperInk1234!",
        role: "author",
      },
    });

    const response = await handleDashboardUsersAction(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response after create action");
    }

    expect(createUserMock).toHaveBeenCalledWith(
      { query: {} },
      expect.objectContaining({
        displayName: "Ayla Author",
        email: "author@example.com",
        isActive: true,
        role: "author",
      }),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/tr/dashboard/users");
  }, 20000);

  it("returns a 403 form error for non-admin action attempts", async () => {
    const { handleDashboardUsersAction } =
      await import("~/features/dashboard/users/server");

    const request = new Request("http://localhost:3000/dashboard/users", {
      body: new URLSearchParams({
        displayName: "Blocked Author",
        email: "blocked@example.com",
        intent: "create",
        password: "PaperInk1234!",
        role: "author",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
      },
    });

    const response = await handleDashboardUsersAction(context, request);

    expect(createUserMock).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        errors: {
          form: "Bu flow icin erisim yetkiniz yoktur.",
        },
      },
      init: {
        status: 403,
      },
    });
  }, 20000);

  it("deactivates users instead of deleting them", async () => {
    const { handleDashboardUsersAction } =
      await import("~/features/dashboard/users/server");

    const request = new Request("http://localhost:3000/dashboard/users", {
      body: new URLSearchParams({
        intent: "delete",
        userId: "user-author",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    getUserByIdMock.mockResolvedValue({
      id: "user-author",
      isActive: true,
      role: "author",
    });

    const response = await handleDashboardUsersAction(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response after deactivate action");
    }

    expect(deactivateUserMock).toHaveBeenCalledWith({ query: {} }, "user-author");
    expect(response.headers.get("Location")).toBe("/tr/dashboard/users");
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/public/blog/page-1",
    );
  }, 20000);

  it("blocks deactivating the last active admin", async () => {
    const { handleDashboardUsersAction } =
      await import("~/features/dashboard/users/server");

    const request = new Request("http://localhost:3000/dashboard/users", {
      body: new URLSearchParams({
        intent: "delete",
        userId: "user-admin",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    getUserByIdMock.mockResolvedValue({
      id: "user-admin",
      isActive: true,
      role: "admin",
    });
    countActiveAdminsMock.mockResolvedValue(1);

    const response = await handleDashboardUsersAction(context, request);

    expect(deactivateUserMock).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        errors: {
          form: "Son aktif admin hesabi pasiflestirilemez.",
        },
      },
      init: {
        status: 409,
      },
    });
  }, 20000);

  it("blocks demoting the last active admin to author", async () => {
    const { handleDashboardUsersAction } =
      await import("~/features/dashboard/users/server");

    const request = new Request("http://localhost:3000/dashboard/users", {
      body: new URLSearchParams({
        displayName: "Enes Admin",
        email: "admin@example.com",
        intent: "update",
        isActive: "on",
        password: "",
        role: "author",
        userId: "user-admin",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    parseUserFormDataMock.mockReturnValue({
      data: {
        avatarUrl: "",
        bio: "",
        displayName: "Enes Admin",
        email: "admin@example.com",
        isActive: true,
        password: "",
        role: "author",
      },
    });
    getUserByIdMock.mockResolvedValue({
      id: "user-admin",
      isActive: true,
      role: "admin",
    });
    countActiveAdminsMock.mockResolvedValue(1);

    const response = await handleDashboardUsersAction(context, request);

    expect(updateUserMock).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        errors: {
          form: "Son aktif admin hesabi author rolune dusurulemez.",
        },
      },
      init: {
        status: 409,
      },
    });
  });

  it("purges the cached blog archive after a user update", async () => {
    const { handleDashboardUsersAction } =
      await import("~/features/dashboard/users/server");

    const request = new Request("http://localhost:3000/dashboard/users", {
      body: new URLSearchParams({
        displayName: "Updated Author",
        email: "author@example.com",
        intent: "update",
        isActive: "on",
        password: "",
        role: "author",
        userId: "user-author",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    parseUserFormDataMock.mockReturnValue({
      data: {
        avatarUrl: "",
        bio: "",
        displayName: "Updated Author",
        email: "author@example.com",
        isActive: true,
        password: "",
        role: "author",
      },
    });
    getUserByIdMock.mockResolvedValue({
      id: "user-author",
      isActive: true,
      role: "author",
    });
    isUserEmailTakenMock.mockResolvedValue(false);

    const response = await handleDashboardUsersAction(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response after update action");
    }

    expect(updateUserMock).toHaveBeenCalledWith(
      { query: {} },
      "user-author",
      expect.objectContaining({
        displayName: "Updated Author",
      }),
    );
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/public/blog/page-1",
    );
  }, 20000);
});
