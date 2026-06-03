import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  handleDashboardPostsActionMock,
  handleDashboardProjectsActionMock,
  handleDashboardResourcesActionMock,
  handleDashboardSkillsActionMock,
  handleDashboardUsersActionMock,
  loadDashboardLayoutDataMock,
  loadDashboardPostsDataMock,
  loadDashboardProjectsDataMock,
  loadDashboardResourcesDataMock,
  loadDashboardSkillsDataMock,
  loadDashboardUsersDataMock,
} = vi.hoisted(() => ({
  handleDashboardPostsActionMock: vi.fn(),
  handleDashboardProjectsActionMock: vi.fn(),
  handleDashboardResourcesActionMock: vi.fn(),
  handleDashboardSkillsActionMock: vi.fn(),
  handleDashboardUsersActionMock: vi.fn(),
  loadDashboardLayoutDataMock: vi.fn(),
  loadDashboardPostsDataMock: vi.fn(),
  loadDashboardProjectsDataMock: vi.fn(),
  loadDashboardResourcesDataMock: vi.fn(),
  loadDashboardSkillsDataMock: vi.fn(),
  loadDashboardUsersDataMock: vi.fn(),
}));

vi.mock("~/features/dashboard/layout/server", () => ({
  loadDashboardLayoutData: loadDashboardLayoutDataMock,
}));

vi.mock("~/features/dashboard/posts/server", () => ({
  handleDashboardPostsAction: handleDashboardPostsActionMock,
  loadDashboardPostsData: loadDashboardPostsDataMock,
}));

vi.mock("~/features/dashboard/projects/server", () => ({
  handleDashboardProjectsAction: handleDashboardProjectsActionMock,
  loadDashboardProjectsData: loadDashboardProjectsDataMock,
}));

vi.mock("~/features/dashboard/skills/server", () => ({
  handleDashboardSkillsAction: handleDashboardSkillsActionMock,
  loadDashboardSkillsData: loadDashboardSkillsDataMock,
}));

vi.mock("~/features/dashboard/users/server", () => ({
  handleDashboardUsersAction: handleDashboardUsersActionMock,
  loadDashboardUsersData: loadDashboardUsersDataMock,
}));

vi.mock("~/features/dashboard/resources/server", () => ({
  handleDashboardResourcesAction: handleDashboardResourcesActionMock,
  loadDashboardResourcesData: loadDashboardResourcesDataMock,
}));

describe("dashboard route modules", () => {
  beforeEach(() => {
    handleDashboardPostsActionMock.mockReset();
    handleDashboardProjectsActionMock.mockReset();
    handleDashboardResourcesActionMock.mockReset();
    handleDashboardSkillsActionMock.mockReset();
    handleDashboardUsersActionMock.mockReset();
    loadDashboardLayoutDataMock.mockReset();
    loadDashboardPostsDataMock.mockReset();
    loadDashboardProjectsDataMock.mockReset();
    loadDashboardResourcesDataMock.mockReset();
    loadDashboardSkillsDataMock.mockReset();
    loadDashboardUsersDataMock.mockReset();
  });

  it("delegates dashboard loaders to their feature servers", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/dashboard");
    const context = { db: { query: {} }, runtime: { platform: "node" } } as never;
    const layoutData = { user: { id: "user-1" } };
    const grantedData = { access: "granted" };

    loadDashboardLayoutDataMock.mockResolvedValueOnce(layoutData);
    loadDashboardPostsDataMock.mockResolvedValueOnce(grantedData);
    loadDashboardProjectsDataMock.mockResolvedValueOnce(grantedData);
    loadDashboardSkillsDataMock.mockResolvedValueOnce(grantedData);
    loadDashboardUsersDataMock.mockResolvedValueOnce(grantedData);
    loadDashboardResourcesDataMock.mockResolvedValueOnce(grantedData);

    const { loader: layoutLoader } = await import("~/routes/dashboard/layout");
    const { loader: postsLoader } = await import("~/routes/dashboard/posts");
    const { loader: projectsLoader } = await import("~/routes/dashboard/projects");
    const { loader: skillsLoader } = await import("~/routes/dashboard/skills");
    const { loader: usersLoader } = await import("~/routes/dashboard/users");
    const { loader: resourcesLoader } =
      await import("~/routes/dashboard/resources/layout");

    await expect(layoutLoader({ context, params: {}, request } as never)).resolves.toBe(
      layoutData,
    );
    await expect(postsLoader({ context, params: {}, request } as never)).resolves.toBe(
      grantedData,
    );
    await expect(
      projectsLoader({ context, params: {}, request } as never),
    ).resolves.toBe(grantedData);
    await expect(skillsLoader({ context, params: {}, request } as never)).resolves.toBe(
      grantedData,
    );
    await expect(usersLoader({ context, params: {}, request } as never)).resolves.toBe(
      grantedData,
    );
    await expect(
      resourcesLoader({ context, params: {}, request } as never),
    ).resolves.toBe(grantedData);
  });

  it("delegates dashboard actions to their feature servers", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/dashboard/posts", {
      body: new FormData(),
      headers: {
        origin: "https://paper-portfolio-ink.dev",
      },
      method: "POST",
    });
    const context = { db: { query: {} }, runtime: { platform: "node" } } as never;
    const response = new Response(null, { status: 302 });

    handleDashboardPostsActionMock.mockResolvedValueOnce(response);
    handleDashboardProjectsActionMock.mockResolvedValueOnce(response);
    handleDashboardSkillsActionMock.mockResolvedValueOnce(response);
    handleDashboardUsersActionMock.mockResolvedValueOnce(response);
    handleDashboardResourcesActionMock.mockResolvedValueOnce(response);

    const { action: postsAction } = await import("~/routes/dashboard/posts");
    const { action: projectsAction } = await import("~/routes/dashboard/projects");
    const { action: skillsAction } = await import("~/routes/dashboard/skills");
    const { action: usersAction } = await import("~/routes/dashboard/users");
    const { action: resourcesAction } =
      await import("~/routes/dashboard/resources/layout");

    await expect(postsAction({ context, params: {}, request } as never)).resolves.toBe(
      response,
    );
    await expect(
      projectsAction({ context, params: {}, request } as never),
    ).resolves.toBe(response);
    await expect(skillsAction({ context, params: {}, request } as never)).resolves.toBe(
      response,
    );
    await expect(usersAction({ context, params: {}, request } as never)).resolves.toBe(
      response,
    );
    await expect(
      resourcesAction({ context, params: {}, request } as never),
    ).resolves.toBe(response);
  });

  it("rejects dashboard mutations without a same-origin header", async () => {
    const context = { db: { query: {} }, runtime: { platform: "node" } } as never;
    const { action: postsAction } = await import("~/routes/dashboard/posts");

    await expect(
      postsAction({
        context,
        params: {},
        request: new Request("https://paper-portfolio-ink.dev/dashboard/posts", {
          body: new FormData(),
          method: "POST",
        }),
      } as never),
    ).rejects.toMatchObject({
      code: "security.csrf.invalid_origin",
      status: 403,
    });

    expect(handleDashboardPostsActionMock).not.toHaveBeenCalled();
  });
});
