import type { AppLoadContext } from "react-router";
import type * as ProjectFormServerModule from "../../app/lib/projects/project-form.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createProjectMock,
  deleteProjectMock,
  findAvailableProjectSlugMock,
  isProjectSlugTakenMock,
  listProjectsMock,
  parseProjectFormDataMock,
  updateProjectMock,
} = vi.hoisted(() => ({
  createProjectMock: vi.fn(),
  deleteProjectMock: vi.fn(),
  findAvailableProjectSlugMock: vi.fn(),
  isProjectSlugTakenMock: vi.fn(),
  listProjectsMock: vi.fn(),
  parseProjectFormDataMock: vi.fn(),
  updateProjectMock: vi.fn(),
}));

vi.mock("../../app/lib/projects/projects.server", () => ({
  createProject: createProjectMock,
  deleteProject: deleteProjectMock,
  findAvailableProjectSlug: findAvailableProjectSlugMock,
  isProjectSlugTaken: isProjectSlugTakenMock,
  listProjects: listProjectsMock,
  updateProject: updateProjectMock,
}));

vi.mock("../../app/lib/projects/project-form.server", async () => {
  const actual = await vi.importActual<typeof ProjectFormServerModule>(
    "../../app/lib/projects/project-form.server",
  );

  return {
    ...actual,
    parseProjectFormData: parseProjectFormDataMock,
  };
});

describe("dashboard projects server", () => {
  const context = {
    db: { query: {} } as never,
  } as unknown as AppLoadContext;

  beforeEach(() => {
    createProjectMock.mockReset();
    deleteProjectMock.mockReset();
    findAvailableProjectSlugMock.mockReset();
    isProjectSlugTakenMock.mockReset();
    listProjectsMock.mockReset();
    parseProjectFormDataMock.mockReset();
    updateProjectMock.mockReset();
  });

  it("returns a slug field error and suggestion when the submitted project slug is taken", async () => {
    const { handleDashboardProjectsAction } =
      await import("../../app/features/dashboard/projects/dashboard-projects.server");

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
    isProjectSlugTakenMock.mockResolvedValue(true);
    findAvailableProjectSlugMock.mockResolvedValue("paper-portfolio-ink-2");

    const response = await handleDashboardProjectsAction(context, request);

    expect(createProjectMock).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        errors: {
          slug: "Bu slug zaten kullanimda. Baska bir slug sec.",
        },
        slugSuggestion: "paper-portfolio-ink-2",
      },
      init: {
        status: 409,
      },
    });
  });
});
