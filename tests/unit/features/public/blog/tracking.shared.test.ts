import { describe, expect, it } from "vitest";

import {
  buildPublicBlogViewLockCookie,
  hasActivePublicBlogViewLock,
  normalizeTrackedPostViewMetrics,
  PUBLIC_BLOG_VIEW_LOCK_COOKIE_NAME,
  readPublicBlogViewLockSnapshot,
} from "~/features/public/blog/tracking/shared";

function extractCookiePair(setCookieHeader: string) {
  return setCookieHeader.split(";")[0] ?? "";
}

describe("public blog tracking shared helpers", () => {
  it("detects active locks and ignores expired entries", () => {
    const now = new Date("2026-05-26T10:00:00.000Z");
    const cookieHeader = `${PUBLIC_BLOG_VIEW_LOCK_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify({
        "edge-runtime-field-notes": now.getTime() + 60_000,
        "expired-note": now.getTime() - 60_000,
      }),
    )}`;

    expect(
      hasActivePublicBlogViewLock(cookieHeader, "edge-runtime-field-notes", now),
    ).toBe(true);
    expect(hasActivePublicBlogViewLock(cookieHeader, "expired-note", now)).toBe(false);
    expect(readPublicBlogViewLockSnapshot(cookieHeader, now)).toEqual({
      "edge-runtime-field-notes": now.getTime() + 60_000,
    });
  });

  it("builds a merged cookie payload while pruning expired locks", () => {
    const now = new Date("2026-05-26T10:00:00.000Z");
    const cookieHeader = `${PUBLIC_BLOG_VIEW_LOCK_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify({
        "edge-runtime-field-notes": now.getTime() + 30 * 60_000,
        "expired-note": now.getTime() - 60_000,
      }),
    )}`;

    const setCookieHeader = buildPublicBlogViewLockCookie({
      cookieHeader,
      expiresAt: new Date("2026-05-26T18:00:00.000Z"),
      now,
      slug: "analytics-playbook",
    });

    expect(setCookieHeader).toContain(`${PUBLIC_BLOG_VIEW_LOCK_COOKIE_NAME}=`);
    expect(setCookieHeader).toContain("SameSite=Lax");

    expect(
      readPublicBlogViewLockSnapshot(extractCookiePair(setCookieHeader), now),
    ).toEqual({
      "analytics-playbook": new Date("2026-05-26T18:00:00.000Z").getTime(),
      "edge-runtime-field-notes": now.getTime() + 30 * 60_000,
    });
  });

  it("normalizes tracked view metrics into bounded integers", () => {
    expect(
      normalizeTrackedPostViewMetrics({
        scrollRate: 132.7,
        secondsSpent: 92.4,
      }),
    ).toEqual({
      scrollRate: 100,
      secondsSpent: 92,
    });

    expect(
      normalizeTrackedPostViewMetrics({
        scrollRate: -5,
        secondsSpent: 99_999,
      }),
    ).toEqual({
      scrollRate: 0,
      secondsSpent: 86_400,
    });
  });
});
