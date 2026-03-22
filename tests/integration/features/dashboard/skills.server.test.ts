import type { AppLoadContext } from "react-router";
import type * as SkillFormServerModule from "~/lib/skills/skill-form.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cacheDeleteMock,
  cacheGetMock,
  cacheSetMock,
  createSkillMock,
  deleteSkillMock,
  isSkillSlugTakenMock,
  listSkillsMock,
  parseSkillFormDataMock,
  requireSessionMock,
  updateSkillMock,
} = vi.hoisted(() => ({
  cacheDeleteMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
  createSkillMock: vi.fn(),
  deleteSkillMock: vi.fn(),
  isSkillSlugTakenMock: vi.fn(),
  listSkillsMock: vi.fn(),
  parseSkillFormDataMock: vi.fn(),
  requireSessionMock: vi.fn(),
  updateSkillMock: vi.fn(),
}));

vi.mock("~/lib/skills/skills.server", () => ({
  createSkill: createSkillMock,
  deleteSkill: deleteSkillMock,
  isSkillSlugTaken: isSkillSlugTakenMock,
  listSkills: listSkillsMock,
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
    isSkillSlugTakenMock.mockReset();
    listSkillsMock.mockReset();
    parseSkillFormDataMock.mockReset();
    requireSessionMock.mockReset();
    updateSkillMock.mockReset();
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
    listSkillsMock.mockResolvedValue([
      {
        createdAtLabel: "2026-03-21",
        iconKey: "database",
        id: "skill-1",
        name: "Cloudflare D1",
        sortOrder: 3,
        slug: "cloudflare-d1",
        summary: "Distributed relational data workflows for edge-hosted applications.",
      },
    ]);

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

    const response = await loadDashboardSkillsData(
      context,
      new Request("http://localhost:3000/dashboard/skills"),
    );

    if (response instanceof Response) {
      throw new Error("Expected denied skills loader data");
    }

    expect(response).toEqual({
      access: "denied",
    });
    expect(listSkillsMock).not.toHaveBeenCalled();
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

    const response = await handleDashboardSkillsAction(context, request);

    expect(createSkillMock).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        errors: {
          name: "Bu beceri zaten kayitli.",
        },
      },
      init: {
        status: 409,
      },
    });
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

    const response = await handleDashboardSkillsAction(context, request);

    expect(createSkillMock).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        errors: {
          form: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
        },
      },
      init: {
        status: 403,
      },
    });
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
