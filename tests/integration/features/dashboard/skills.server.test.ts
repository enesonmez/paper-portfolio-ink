import type { AppLoadContext } from "react-router";
import type * as SkillFormServerModule from "~/lib/skills/skill-form.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cacheDeleteMock,
  cacheGetMock,
  cacheSetMock,
  createSkillMock,
  deleteSkillMock,
  getSkillByIdMock,
  isSkillSlugTakenMock,
  listSkillsPageMock,
  listSkillsMock,
  parseDashboardSkillsCursorMock,
  parseSkillFormDataMock,
  requireSessionMock,
  updateSkillMock,
} = vi.hoisted(() => ({
  cacheDeleteMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
  createSkillMock: vi.fn(),
  deleteSkillMock: vi.fn(),
  getSkillByIdMock: vi.fn(),
  isSkillSlugTakenMock: vi.fn(),
  listSkillsPageMock: vi.fn(),
  listSkillsMock: vi.fn(),
  parseDashboardSkillsCursorMock: vi.fn(),
  parseSkillFormDataMock: vi.fn(),
  requireSessionMock: vi.fn(),
  updateSkillMock: vi.fn(),
}));

vi.mock("~/lib/skills/skills.server", () => ({
  createSkill: createSkillMock,
  deleteSkill: deleteSkillMock,
  getSkillById: getSkillByIdMock,
  isSkillSlugTaken: isSkillSlugTakenMock,
  listSkills: listSkillsMock,
  listSkillsPage: listSkillsPageMock,
  parseDashboardSkillsCursor: parseDashboardSkillsCursorMock,
  updateSkill: updateSkillMock,
}));

vi.mock("~/lib/skills/skill-form.server", async () => {
  const actual = await vi.importActual<typeof SkillFormServerModule>(
    "~/lib/skills/skill-form.server",
  );

  return {
    ...actual,
    parseSkillFormData: parseSkillFormDataMock,
  };
});

vi.mock("~/shared/auth/session.server", () => ({
  requireSession: requireSessionMock,
}));

describe("dashboard skills server", () => {
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
    createSkillMock.mockReset();
    deleteSkillMock.mockReset();
    getSkillByIdMock.mockReset();
    isSkillSlugTakenMock.mockReset();
    listSkillsPageMock.mockReset();
    listSkillsMock.mockReset();
    parseDashboardSkillsCursorMock.mockReset();
    parseSkillFormDataMock.mockReset();
    requireSessionMock.mockReset();
    updateSkillMock.mockReset();
    parseDashboardSkillsCursorMock.mockReturnValue(null);
  });

  it("loads the skills registry for authenticated sessions", async () => {
    const { loadDashboardSkillsData } =
      await import("~/features/dashboard/skills/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listSkillsPageMock.mockResolvedValue({
      items: [
        {
          createdAtLabel: "2026-03-21",
          iconKey: "database",
          id: "skill-1",
          name: "Cloudflare D1",
          sortOrder: 3,
          slug: "cloudflare-d1",
          summary:
            "Distributed relational data workflows for edge-hosted applications.",
        },
      ],
      pagination: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      },
      totalCount: 1,
    });

    const response = await loadDashboardSkillsData(
      context,
      new Request("http://localhost:3000/dashboard/skills"),
    );

    if (response instanceof Response) {
      throw new Error("Expected skills loader data");
    }

    expect(response).toMatchObject({
      access: "granted",
      form: {
        isOpen: false,
        mode: null,
      },
      metrics: {
        totalCount: 1,
      },
    });

    if (response.access !== "granted") {
      throw new Error("Expected granted skills loader data");
    }

    expect(response.skills).toHaveLength(1);
  }, 20000);

  it("does not expose the skills registry to non-admin sessions", async () => {
    const { loadDashboardSkillsData } =
      await import("~/features/dashboard/skills/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
      },
    });

    await expect(
      loadDashboardSkillsData(
        context,
        new Request("http://localhost:3000/dashboard/skills"),
      ),
    ).rejects.toMatchObject({
      code: "skills.read.forbidden",
      responseData: {
        access: "denied",
      },
      status: 403,
    });
    expect(listSkillsPageMock).not.toHaveBeenCalled();
  });

  it("returns a name error when the submitted skill already exists", async () => {
    const { handleDashboardSkillsAction } =
      await import("~/features/dashboard/skills/server");

    const request = new Request("http://localhost:3000/dashboard/skills", {
      body: new URLSearchParams({
        iconKey: "database",
        intent: "create",
        name: "Cloudflare D1",
        sortOrder: "3",
        summary: "Distributed relational data workflows for edge-hosted applications.",
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
    parseSkillFormDataMock.mockReturnValue({
      data: {
        iconKey: "database",
        name: "Cloudflare D1",
        sortOrder: 3,
        summary: "Distributed relational data workflows for edge-hosted applications.",
      },
    });
    isSkillSlugTakenMock.mockResolvedValue(true);

    await expect(handleDashboardSkillsAction(context, request)).rejects.toMatchObject({
      code: "skills.create.duplicate_slug",
      responseData: {
        errors: {
          name: "Bu beceri zaten kayitli.",
        },
      },
      status: 409,
    });
    expect(createSkillMock).not.toHaveBeenCalled();
  });

  it("returns a 403 form error for non-admin action attempts", async () => {
    const { handleDashboardSkillsAction } =
      await import("~/features/dashboard/skills/server");

    const request = new Request("http://localhost:3000/dashboard/skills", {
      body: new URLSearchParams({
        iconKey: "database",
        intent: "create",
        name: "Cloudflare D1",
        sortOrder: "3",
        summary: "Distributed relational data workflows for edge-hosted applications.",
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

    await expect(handleDashboardSkillsAction(context, request)).rejects.toMatchObject({
      code: "skills.create.forbidden",
      responseData: {
        errors: {
          form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
        },
      },
      status: 403,
    });
    expect(createSkillMock).not.toHaveBeenCalled();
  });

  it("returns a 403 form error for unauthorized update attempts", async () => {
    const { handleDashboardSkillsAction } =
      await import("~/features/dashboard/skills/server");

    const request = new Request("http://localhost:3000/dashboard/skills", {
      body: new URLSearchParams({
        iconKey: "workflow",
        intent: "update",
        name: "Cloudflare Workflows",
        skillId: "skill-1",
        sortOrder: "1",
        summary: "Workflow orchestration for edge-hosted product operations.",
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

    await expect(handleDashboardSkillsAction(context, request)).rejects.toMatchObject({
      code: "skills.update.forbidden",
      responseData: {
        errors: {
          form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
        },
      },
      status: 403,
    });
    expect(parseSkillFormDataMock).not.toHaveBeenCalled();
    expect(updateSkillMock).not.toHaveBeenCalled();
  });

  it("returns a 403 form error for unauthorized delete attempts", async () => {
    const { handleDashboardSkillsAction } =
      await import("~/features/dashboard/skills/server");

    const request = new Request("http://localhost:3000/dashboard/skills", {
      body: new URLSearchParams({
        intent: "delete",
        skillId: "skill-1",
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

    await expect(handleDashboardSkillsAction(context, request)).rejects.toMatchObject({
      code: "skills.delete.forbidden",
      responseData: {
        errors: {
          form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
        },
      },
      status: 403,
    });
    expect(deleteSkillMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported mutation intents before authorization or writes", async () => {
    const { handleDashboardSkillsAction } =
      await import("~/features/dashboard/skills/server");

    const request = new Request("http://localhost:3000/dashboard/skills", {
      body: new URLSearchParams({
        intent: "archive",
        skillId: "skill-1",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    await expect(handleDashboardSkillsAction(context, request)).rejects.toMatchObject({
      code: "skills.mutation.invalid_intent",
      responseData: {
        errors: {
          form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
        },
      },
      status: 400,
    });

    expect(requireSessionMock).not.toHaveBeenCalled();
    expect(createSkillMock).not.toHaveBeenCalled();
    expect(updateSkillMock).not.toHaveBeenCalled();
    expect(deleteSkillMock).not.toHaveBeenCalled();
  });

  it("updates a skill row when a valid edit action is posted", async () => {
    const { handleDashboardSkillsAction } =
      await import("~/features/dashboard/skills/server");

    const request = new Request("http://localhost:3000/dashboard/skills", {
      body: new URLSearchParams({
        iconKey: "workflow",
        intent: "update",
        name: "Cloudflare Workflows",
        skillId: "skill-1",
        sortOrder: "1",
        summary: "Workflow orchestration for edge-hosted product operations.",
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
    parseSkillFormDataMock.mockReturnValue({
      data: {
        iconKey: "workflow",
        name: "Cloudflare Workflows",
        sortOrder: 1,
        summary: "Workflow orchestration for edge-hosted product operations.",
      },
    });
    isSkillSlugTakenMock.mockResolvedValue(false);

    const response = await handleDashboardSkillsAction(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response after update action");
    }

    expect(updateSkillMock).toHaveBeenCalledWith(
      { query: {} },
      "skill-1",
      expect.objectContaining({
        iconKey: "workflow",
        name: "Cloudflare Workflows",
        sortOrder: 1,
      }),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/tr/dashboard/skills");
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/public/home-data",
    );
  });

  it("deletes a skill row when a valid delete action is posted", async () => {
    const { handleDashboardSkillsAction } =
      await import("~/features/dashboard/skills/server");

    const request = new Request("http://localhost:3000/dashboard/skills", {
      body: new URLSearchParams({
        intent: "delete",
        skillId: "skill-1",
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

    const response = await handleDashboardSkillsAction(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response after delete action");
    }

    expect(deleteSkillMock).toHaveBeenCalledWith({ query: {} }, "skill-1");
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/tr/dashboard/skills");
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/public/home-data",
    );
  });
});
