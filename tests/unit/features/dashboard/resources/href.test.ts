import { describe, expect, it } from "vitest";

import {
  buildDashboardResourcesLocalesHref,
  buildDashboardResourcesTranslationsHref,
  normalizeDashboardResourcesPage,
  normalizeDashboardResourcesSearchQuery,
  resolveDashboardResourcesSection,
  resolveDashboardResourcesTranslationLocale,
} from "~/features/dashboard/resources/href";

describe("dashboard resources href helpers", () => {
  const localeRows = [
    {
      code: "tr",
      createdAtLabel: "2026-03-21",
      isActive: true,
      isDefault: true,
      label: "Turkish",
      sortOrder: 0,
      translationCount: 12,
      updatedAtLabel: "2026-03-21",
    },
    {
      code: "en",
      createdAtLabel: "2026-03-21",
      isActive: true,
      isDefault: false,
      label: "English",
      sortOrder: 1,
      translationCount: 10,
      updatedAtLabel: "2026-03-21",
    },
  ];

  it("normalizes query values and resolves the active resources section", () => {
    expect(normalizeDashboardResourcesSearchQuery("  nav  ")).toBe("nav");
    expect(normalizeDashboardResourcesSearchQuery(null)).toBe("");
    expect(normalizeDashboardResourcesPage("0")).toBe(1);
    expect(normalizeDashboardResourcesPage("4")).toBe(4);
    expect(resolveDashboardResourcesSection("/tr/dashboard/resources/locales")).toBe(
      "locales",
    );
    expect(
      resolveDashboardResourcesSection("/en/dashboard/resources/translations"),
    ).toBe("translations");
  });

  it("falls back to default translation locale and builds hrefs", () => {
    expect(resolveDashboardResourcesTranslationLocale("en", localeRows)).toBe("en");
    expect(resolveDashboardResourcesTranslationLocale("de", localeRows)).toBe("tr");
    expect(
      buildDashboardResourcesLocalesHref({
        modal: "edit-locale",
        editLocaleCode: "tr",
      }),
    ).toBe("/dashboard/resources/locales?modal=edit-locale&editLocaleCode=tr");
    expect(
      buildDashboardResourcesTranslationsHref(
        {
          translationLocale: "tr",
          translationPage: 2,
          translationSearch: "  nav  ",
        },
        {
          editTranslationKey: "dashboard.layout.navProjects",
          editTranslationLocale: "tr",
          modal: "edit-translation",
        },
      ),
    ).toBe(
      "/dashboard/resources/translations?translationLocale=tr&translationPage=2&translationSearch=nav&modal=edit-translation&editTranslationLocale=tr&editTranslationKey=dashboard.layout.navProjects",
    );
  });
});
