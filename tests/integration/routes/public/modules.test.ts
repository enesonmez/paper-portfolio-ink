import type * as I18nServerModule from "~/shared/i18n/i18n.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  loadI18nRuntimeStateMock,
  loadPublicBlogDataMock,
  loadPublicBlogFeedDataMock,
  loadPublicBlogPostDataMock,
  trackPublicBlogPostViewMock,
  loadPublicHomeDataMock,
  loadPublicProjectsDataMock,
  loadPublicProjectsFeedDataMock,
} = vi.hoisted(() => ({
  loadI18nRuntimeStateMock: vi.fn(),
  loadPublicBlogDataMock: vi.fn(),
  loadPublicBlogFeedDataMock: vi.fn(),
  loadPublicBlogPostDataMock: vi.fn(),
  trackPublicBlogPostViewMock: vi.fn(),
  loadPublicHomeDataMock: vi.fn(),
  loadPublicProjectsDataMock: vi.fn(),
  loadPublicProjectsFeedDataMock: vi.fn(),
}));

vi.mock("~/features/public/home/server", () => ({
  loadPublicHomeData: loadPublicHomeDataMock,
}));

vi.mock("~/features/public/projects/server", () => ({
  loadPublicProjectsData: loadPublicProjectsDataMock,
  loadPublicProjectsFeedData: loadPublicProjectsFeedDataMock,
}));

vi.mock("~/features/public/blog/server", () => ({
  loadPublicBlogData: loadPublicBlogDataMock,
  loadPublicBlogFeedData: loadPublicBlogFeedDataMock,
  loadPublicBlogPostData: loadPublicBlogPostDataMock,
  trackPublicBlogPostView: trackPublicBlogPostViewMock,
}));

vi.mock("~/shared/i18n/i18n.server", async () => {
  const actual = await vi.importActual<typeof I18nServerModule>(
    "~/shared/i18n/i18n.server",
  );

  return {
    ...actual,
    loadI18nRuntimeState: loadI18nRuntimeStateMock,
  };
});

describe("public route modules", () => {
  beforeEach(() => {
    loadI18nRuntimeStateMock.mockReset();
    loadPublicBlogDataMock.mockReset();
    loadPublicBlogFeedDataMock.mockReset();
    loadPublicBlogPostDataMock.mockReset();
    trackPublicBlogPostViewMock.mockReset();
    loadPublicHomeDataMock.mockReset();
    loadPublicProjectsDataMock.mockReset();
    loadPublicProjectsFeedDataMock.mockReset();
  });

  it("delegates public home, projects, and blog loaders to their feature servers", async () => {
    const context = { db: { query: {} }, runtime: { platform: "node" } } as never;
    const request = new Request("https://paper-portfolio-ink.dev/");
    const payload = { ok: true };

    loadPublicHomeDataMock.mockResolvedValueOnce(payload);
    loadPublicProjectsDataMock.mockResolvedValueOnce(payload);
    loadPublicProjectsFeedDataMock.mockResolvedValueOnce(payload);
    loadPublicBlogDataMock.mockResolvedValueOnce(payload);
    loadPublicBlogFeedDataMock.mockResolvedValueOnce(payload);
    loadPublicBlogPostDataMock.mockResolvedValueOnce(payload);
    trackPublicBlogPostViewMock.mockResolvedValueOnce(payload);

    const { loader: homeLoader } = await import("~/routes/public/home");
    const { loader: projectsLoader } = await import("~/routes/public/projects/index");
    const { loader: projectsFeedLoader } =
      await import("~/routes/public/projects/feed");
    const { loader: blogLoader } = await import("~/routes/public/blog/index");
    const { loader: blogFeedLoader } = await import("~/routes/public/blog/feed");
    const { loader: blogPostLoader } = await import("~/routes/public/blog/$slug");
    const { action: blogTrackAction } = await import("~/routes/public/blog/track");

    await expect(homeLoader({ context, params: {}, request } as never)).resolves.toBe(
      payload,
    );
    await expect(
      projectsLoader({ context, params: {}, request } as never),
    ).resolves.toBe(payload);
    await expect(
      projectsFeedLoader({ context, params: {}, request } as never),
    ).resolves.toBe(payload);
    await expect(blogLoader({ context, params: {}, request } as never)).resolves.toBe(
      payload,
    );
    await expect(
      blogFeedLoader({ context, params: {}, request } as never),
    ).resolves.toBe(payload);
    await expect(
      blogPostLoader({
        context,
        params: { slug: "edge-observability" },
        request,
      } as never),
    ).resolves.toBe(payload);
    await expect(
      blogTrackAction({
        context,
        params: {},
        request: new Request("https://paper-portfolio-ink.dev/tr/blog/track", {
          headers: {
            origin: "https://paper-portfolio-ink.dev",
          },
          method: "POST",
        }),
      } as never),
    ).resolves.toBe(payload);

    expect(loadPublicBlogPostDataMock).toHaveBeenCalledWith(
      context,
      "edge-observability",
    );
    expect(trackPublicBlogPostViewMock).toHaveBeenCalledWith(
      context,
      expect.any(Request),
    );
  });

  it("rejects blog detail loader calls without a slug param", async () => {
    const { loader } = await import("~/routes/public/blog/$slug");

    await expect(
      loader({
        context: { db: { query: {} }, runtime: { platform: "node" } },
        params: {},
      } as never),
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("redirects the public theme action through localized fallbacks and cookies", async () => {
    loadI18nRuntimeStateMock
      .mockResolvedValueOnce({
        locale: "tr",
        supportedLocaleCodes: ["tr", "en"],
      })
      .mockResolvedValueOnce({
        locale: "tr",
        supportedLocaleCodes: ["tr", "en"],
      });

    const { action } = await import("~/routes/public/theme");

    const invalidResponse = await action({
      context: { db: { query: {} }, runtime: { platform: "node" } },
      params: {},
      request: new Request("https://paper-portfolio-ink.dev/theme", {
        body: new URLSearchParams({
          intent: "invalid",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          origin: "https://paper-portfolio-ink.dev",
        },
        method: "POST",
      }),
    } as never);
    const validResponse = await action({
      context: { db: { query: {} }, runtime: { platform: "node" } },
      params: {},
      request: new Request("https://paper-portfolio-ink.dev/theme", {
        body: new URLSearchParams({
          intent: "set-theme",
          redirectTo: "/tr/blog",
          theme: "dark",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          origin: "https://paper-portfolio-ink.dev",
        },
        method: "POST",
      }),
    } as never);

    expect(invalidResponse.status).toBe(302);
    expect(invalidResponse.headers.get("location")).toBe("/tr");

    expect(validResponse.status).toBe(302);
    expect(validResponse.headers.get("location")).toBe("/tr/blog");
    expect(validResponse.headers.get("set-cookie")).toContain("paper-theme=dark");
  });

  it("rejects public mutation routes without a same-origin header", async () => {
    const context = { db: { query: {} }, runtime: { platform: "node" } } as never;
    const { action: themeAction } = await import("~/routes/public/theme");
    const { action: blogTrackAction } = await import("~/routes/public/blog/track");

    await expect(
      themeAction({
        context,
        params: {},
        request: new Request("https://paper-portfolio-ink.dev/theme", {
          body: new URLSearchParams({
            intent: "set-theme",
            redirectTo: "/tr/blog",
            theme: "dark",
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        }),
      } as never),
    ).rejects.toMatchObject({
      code: "security.csrf.invalid_origin",
      status: 403,
    });
    await expect(
      blogTrackAction({
        context,
        params: {},
        request: new Request("https://paper-portfolio-ink.dev/tr/blog/track", {
          method: "POST",
        }),
      } as never),
    ).rejects.toMatchObject({
      code: "analytics.track.invalid_origin",
      status: 403,
    });

    expect(trackPublicBlogPostViewMock).not.toHaveBeenCalled();
  });
});
