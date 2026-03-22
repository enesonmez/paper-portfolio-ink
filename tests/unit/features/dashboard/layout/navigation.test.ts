import { describe, expect, it } from "vitest";

import { getDashboardNavigation } from "~/features/dashboard/layout/navigation";
import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";

const t = createTranslator(getSeedMessages("tr"));

describe("dashboard navigation", () => {
  it("includes admin-only links with locale-aware targets", () => {
    const navigation = getDashboardNavigation("tr", "admin", t);
    const linkTargets = navigation
      .filter((item) => item.kind === "link")
      .map((item) => item.to);

    expect(linkTargets).toEqual(
      expect.arrayContaining([
        "/tr/dashboard",
        "/tr/dashboard/posts",
        "/tr/dashboard/projects",
        "/tr/dashboard/resources",
        "/tr/dashboard/skills",
        "/tr/dashboard/users",
      ]),
    );
  });

  it("omits admin-only links for non-admin roles and keeps static settings", () => {
    const navigation = getDashboardNavigation("en", "author", t);
    const linkTargets = navigation
      .filter((item) => item.kind === "link")
      .map((item) => item.to);
    const staticItem = navigation.find((item) => item.kind === "static");

    expect(linkTargets).toEqual([
      "/en/dashboard",
      "/en/dashboard/posts",
      "/en/dashboard/projects",
    ]);
    expect(staticItem).toMatchObject({
      kind: "static",
      label: t("dashboard.layout.navSettings"),
      note: t("dashboard.layout.navStatusLater"),
    });
  });
});
