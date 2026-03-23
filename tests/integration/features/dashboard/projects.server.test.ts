import type { AppLoadContext } from "react-router";
import type * as ProjectFormServerModule from "~/lib/projects/project-form.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cacheDeleteMock,
  cacheGetMock,
  cacheSetMock,
  createProjectMock,
  deleteProjectMock,
  findAvailableProjectSlugMock,
  isProjectSlugTakenMock,
  listProjectsMock,
  parseProjectFormDataMock,
  requireSessionMock,
  updateProjectMock,
} = vi.hoisted(() => ({
  cacheDeleteMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
  createProjectMock: vi.fn(),
  deleteProjectMock: vi.fn(),
  findAvailableProjectSlugMock: vi.fn(),
  isProjectSlugTakenMock: vi.fn(),
  listProjectsMock: vi.fn(),
  parseProjectFormDataMock: vi.fn(),
  requireSessionMock: vi.fn(),
  updateProjectMock: vi.fn(),
}));

vi.mock("~/lib/projects/projects.server", () => ({
  createProject: createProjectMock,
  deleteProject: deleteProjectMock,
  findAvailableProjectSlug: findAvailableProjectSlugMock,
  isProjectSlugTaken: isProjectSlugTakenMock,
  listProjects: listProjectsMock,
  updateProject: updateProjectMock,
}));

vi.mock("~/lib/projects/project-form.server", async () => {
  const actual = await vi.importActual<typeof ProjectFormServerModule>(
    "~/lib/projects/project-form.server",
  );

  return {
    ...actual,
    parseProjectFormData: parseProjectFormDataMock,
  };
});

vi.mock("~/shared/auth/session.server", () => ({
  requireSession: requireSessionMock,
}));

describe("dashboard projects server", () => {
  const context = {
    cache: {
      delete: cacheDeleteMock,
      get: cacheGetMock,
      set: cacheSetMock,
    },
    db: { query: {} } as never,
    runtime: { platform: "node" as const },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    cacheDeleteMock.mockReset();
    cacheGetMock.mockReset();
    cacheSetMock.mockReset();
    createProjectMock.mockReset();
    deleteProjectMock.mockReset();
    findAvailableProjectSlugMock.mockReset();
    isProjectSlugTakenMock.mockReset();
    listProjectsMock.mockReset();
    parseProjectFormDataMock.mockReset();
    requireSessionMock.mockReset();
    updateProjectMock.mockReset();
  });

  it("returns a slug field error and suggestion when the submitted project slug is taken", async () => {
    const { handleDashboardProjectsAction } =
      await import("~/features/dashboard/projects/server");

    const request = new Request("http://localhost:3000/dashboard/projects", {
      body: new URLSearchParams({
        intent: "create",
        slug: "paper-portfolio-ink",
        sortOrder: "1",
        status: "published",
        summary: "Portfolio and editorial system for Cloudflare.",
        title: "Paper Portfolio Ink",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    parseProjectFormDataMock.mockReturnValue({
      data: {
        coverImageUrl: "",
        description: "",
        isFeatured: false,
        liveUrl: "",
        repositoryUrl: "",
        slug: "paper-portfolio-ink",
        sortOrder: 1,
        status: "published",
        summary: "Portfolio and editorial system for Cloudflare.",
        title: "Paper Portfolio Ink",
      },
    });
    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    isProjectSlugTakenMock.mockResolvedValue(true);
    findAvailableProjectSlugMock.mockResolvedValue("paper-portfolio-ink-2");

    await expect(handleDashboardProjectsAction(context, request)).rejects.toMatchObject(
      {
        code: "projects.create.duplicate_slug",
        responseData: {
          errors: {
            slug: "Bu slug zaten kullanimda. Baska bir slug sec.",
          },
          slugSuggestion: "paper-portfolio-ink-2",
        },
        status: 409,
      },
    );
    expect(createProjectMock).not.toHaveBeenCalled();
  });

  it("purges the public project caches after a delete mutation", async () => {
    const { handleDashboardProjectsAction } =
      await import("~/features/dashboard/projects/server");

    const request = new Request("http://localhost:3000/dashboard/projects", {
      body: new URLSearchParams({
        intent: "delete",
        projectId: "project-1",
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

    const response = await handleDashboardProjectsAction(context, request);

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response after delete action");
    }

    expect(deleteProjectMock).toHaveBeenCalledWith({ query: {} }, "project-1");
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/public/home-data",
    );
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/public/projects/page-1",
    );
  });
});
