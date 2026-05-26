import type { AppLoadContext } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  acquirePostViewHistoryLockMock,
  getPublishedPostAnalyticsTargetBySlugMock,
  insertPostViewHistoryEntryMock,
} = vi.hoisted(() => ({
  acquirePostViewHistoryLockMock: vi.fn<
    (
      db: unknown,
      args: {
        lockedUntil: Date;
        now: Date;
        postId: string;
        userHash: string;
      },
    ) => Promise<boolean>
  >(),
  getPublishedPostAnalyticsTargetBySlugMock:
    vi.fn<
      (db: unknown, slug: string) => Promise<{ id: string; slug: string } | null>
    >(),
  insertPostViewHistoryEntryMock: vi.fn<
    (
      db: unknown,
      args: {
        postId: string;
        scrollRate: number;
        secondsSpent: number;
        userHash: string;
      },
    ) => Promise<void>
  >(),
}));

vi.mock("~/lib/analytics/view-history.server", () => ({
  acquirePostViewHistoryLock: acquirePostViewHistoryLockMock,
  getPublishedPostAnalyticsTargetBySlug: getPublishedPostAnalyticsTargetBySlugMock,
  insertPostViewHistoryEntry: insertPostViewHistoryEntryMock,
}));

describe("public blog tracking server", () => {
  const context = {
    analytics: {
      secret: "analytics-secret",
    },
    db: { query: {} },
    runtime: { platform: "node" as const },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T10:00:00.000Z"));
    acquirePostViewHistoryLockMock.mockReset();
    getPublishedPostAnalyticsTargetBySlugMock.mockReset();
    insertPostViewHistoryEntryMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("captures a first-time post view and sets a cookie lock", async () => {
    getPublishedPostAnalyticsTargetBySlugMock.mockResolvedValue({
      id: "post-1",
      slug: "edge-runtime-field-notes",
    });
    acquirePostViewHistoryLockMock.mockResolvedValue(true);
    insertPostViewHistoryEntryMock.mockResolvedValue(undefined);

    const request = new Request("https://paper-portfolio-ink.dev/tr/blog/track", {
      body: new URLSearchParams({
        scrollRate: "82",
        secondsSpent: "47",
        slug: "edge-runtime-field-notes",
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://paper-portfolio-ink.dev",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0",
        "x-forwarded-for": "203.0.113.7",
      },
      method: "POST",
    });

    const { trackPublicBlogPostView } =
      await import("~/features/public/blog/tracking/server");
    const response = await trackPublicBlogPostView(context, request);
    const insertedEntry = insertPostViewHistoryEntryMock.mock.calls[0]?.[1];

    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("set-cookie")).toContain("paper-view-lock=");
    expect(acquirePostViewHistoryLockMock).toHaveBeenCalledWith(
      context.db,
      expect.objectContaining({
        postId: "post-1",
      }),
    );
    expect(insertPostViewHistoryEntryMock).toHaveBeenCalledWith(
      context.db,
      expect.any(Object),
    );
    expect(insertedEntry).toMatchObject({
      postId: "post-1",
      scrollRate: 82,
      secondsSpent: 47,
    });
    expect(insertedEntry?.userHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("suppresses duplicate inserts inside the 12-hour throttle window", async () => {
    getPublishedPostAnalyticsTargetBySlugMock.mockResolvedValue({
      id: "post-1",
      slug: "edge-runtime-field-notes",
    });
    acquirePostViewHistoryLockMock.mockResolvedValue(false);

    const request = new Request("https://paper-portfolio-ink.dev/tr/blog/track", {
      body: new URLSearchParams({
        scrollRate: "99",
        secondsSpent: "120",
        slug: "edge-runtime-field-notes",
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://paper-portfolio-ink.dev",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0",
        "x-forwarded-for": "203.0.113.7",
      },
      method: "POST",
    });

    const { trackPublicBlogPostView } =
      await import("~/features/public/blog/tracking/server");
    const response = await trackPublicBlogPostView(context, request);

    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=43200");
    expect(insertPostViewHistoryEntryMock).not.toHaveBeenCalled();
  });

  it("rejects cross-site tracking attempts", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/tr/blog/track", {
      body: new URLSearchParams({
        scrollRate: "50",
        secondsSpent: "15",
        slug: "edge-runtime-field-notes",
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0",
        "x-forwarded-for": "203.0.113.7",
      },
      method: "POST",
    });

    const { trackPublicBlogPostView } =
      await import("~/features/public/blog/tracking/server");

    await expect(trackPublicBlogPostView(context, request)).rejects.toMatchObject({
      code: "analytics.track.invalid_origin",
      status: 403,
    });
  });

  it("rejects invalid beacon payloads", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/tr/blog/track", {
      body: new URLSearchParams({
        scrollRate: "500",
        secondsSpent: "-2",
        slug: "",
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://paper-portfolio-ink.dev",
        "sec-fetch-site": "same-origin",
      },
      method: "POST",
    });

    const { trackPublicBlogPostView } =
      await import("~/features/public/blog/tracking/server");

    await expect(trackPublicBlogPostView(context, request)).rejects.toMatchObject({
      code: "analytics.validation",
      status: 400,
    });
  });

  it("rejects tracking requests that do not include an origin header", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/tr/blog/track", {
      body: new URLSearchParams({
        scrollRate: "50",
        secondsSpent: "15",
        slug: "edge-runtime-field-notes",
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "sec-fetch-site": "same-origin",
      },
      method: "POST",
    });

    const { trackPublicBlogPostView } =
      await import("~/features/public/blog/tracking/server");

    await expect(trackPublicBlogPostView(context, request)).rejects.toMatchObject({
      code: "analytics.track.invalid_origin",
      status: 403,
    });
  });
});
