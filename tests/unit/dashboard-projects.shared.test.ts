import { describe, expect, it } from "vitest";

describe("dashboard projects shared helpers", () => {
  it("builds stable dashboard project URLs from typed params", async () => {
    const { buildDashboardProjectsHref } =
      await import("../../app/features/dashboard/projects/state");

    expect(buildDashboardProjectsHref()).toBe("/dashboard/projects");
    expect(buildDashboardProjectsHref({ modal: "create" })).toBe(
      "/dashboard/projects?modal=create",
    );
    expect(buildDashboardProjectsHref({ editId: "project-1" })).toBe(
      "/dashboard/projects?edit=project-1",
    );
  });

  it("maps project status to consistent badge tones", async () => {
    const { getProjectStatusTone } =
      await import("../../app/features/dashboard/projects/state");

    expect(getProjectStatusTone("draft")).toBe("warning");
    expect(getProjectStatusTone("published")).toBe("success");
    expect(getProjectStatusTone("archived")).toBe("neutral");
  });

  it("resolves edit mode state from query params and selected project", async () => {
    const { resolveDashboardProjectsForm } =
      await import("../../app/features/dashboard/projects/state");

    expect(
      resolveDashboardProjectsForm({
        editId: "project-1",
        modal: null,
        projects: [
          {
            coverImageUrl: null,
            createdAtLabel: "2026-03-16",
            description: "Detailed case study",
            id: "project-1",
            isFeatured: true,
            liveUrl: "https://paper-portfolio-ink.dev",
            repositoryUrl: "https://github.com/enesonmez/paper-portfolio-ink",
            slug: "paper-portfolio-ink",
            sortOrder: 2,
            status: "published",
            summary: "Personal site",
            title: "Paper Enes Ink",
          },
        ],
      }),
    ).toEqual({
      editingProjectId: "project-1",
      isOpen: true,
      mode: "edit",
      slugSuggestion: null,
      values: {
        coverImageUrl: "",
        description: "Detailed case study",
        isFeatured: true,
        liveUrl: "https://paper-portfolio-ink.dev",
        repositoryUrl: "https://github.com/enesonmez/paper-portfolio-ink",
        slug: "paper-portfolio-ink",
        sortOrder: "2",
        status: "published",
        summary: "Personal site",
        title: "Paper Enes Ink",
      },
    });
  });
});
