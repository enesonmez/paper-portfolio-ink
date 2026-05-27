import { describe, expect, it } from "vitest";
import {
  buildDashboardAnalyticsHref,
  buildDashboardAnalyticsFilters,
  buildDashboardAnalyticsViewState,
} from "~/features/dashboard/analytics/state";

describe("dashboard analytics state", () => {
  it("builds correct URL query strings matching parameter contract", () => {
    const defaultUrl = buildDashboardAnalyticsHref();
    expect(defaultUrl).toBe("/dashboard/analytics");

    const searchUrl = buildDashboardAnalyticsHref({ search: "hello" });
    expect(searchUrl).toBe("/dashboard/analytics?search=hello");

    const modalUrl = buildDashboardAnalyticsHref({ view: "post-123" });
    expect(modalUrl).toBe("/dashboard/analytics?view=post-123");

    const combinedUrl = buildDashboardAnalyticsHref({
      search: "edge",
      view: "post-456",
    });
    expect(combinedUrl).toBe("/dashboard/analytics?search=edge&view=post-456");
  });

  it("normalizes and parses URL search query filters", () => {
    const url = new URL("http://localhost/dashboard/analytics?search=%20test%20");
    const viewState = buildDashboardAnalyticsViewState(url);
    expect(viewState.searchQuery).toBe("test");

    const filters = buildDashboardAnalyticsFilters(viewState);
    expect(filters.searchQuery).toBe("test");
  });
});
