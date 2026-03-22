import { describe, expect, it } from "vitest";

import { DASHBOARD_RESOURCES_MODAL } from "~/features/dashboard/resources/href";
import {
  buildDashboardResourcesMetrics,
  buildDashboardResourcesTranslationPagination,
  mergeDashboardResourcesLocaleFormState,
  mergeDashboardResourcesTranslationFormState,
  resolveDashboardResourcesState,
} from "~/features/dashboard/resources/state";

describe("dashboard resources state helpers", () => {
  it("builds metrics and clamps translation pagination", () => {
    expect(
      buildDashboardResourcesMetrics(
        [
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
            isActive: false,
            isDefault: false,
            label: "English",
            sortOrder: 1,
            translationCount: 7,
            updatedAtLabel: "2026-03-21",
          },
        ],
        12,
      ),
    ).toEqual({
      activeLocales: 1,
      selectedLocaleTranslations: 12,
      totalLocales: 2,
      totalTranslations: 19,
    });
    expect(
      buildDashboardResourcesTranslationPagination({
        currentPage: 99,
        totalItems: 21,
      }),
    ).toEqual({
      currentPage: 2,
      pageCount: 2,
      pageSize: 20,
      totalItems: 21,
    });
  });

  it("resolves locale and translation edit state from modal params", () => {
    const state = resolveDashboardResourcesState({
      editLocaleCode: "tr",
      editTranslationKey: "dashboard.layout.navProjects",
      editTranslationLocale: "tr",
      localeRows: [
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
      ],
      modal: DASHBOARD_RESOURCES_MODAL.editTranslation,
      selectedTranslationLocale: "tr",
      translationRecord: {
        createdAtLabel: "2026-03-21",
        key: "dashboard.layout.navProjects",
        locale: "tr",
        updatedAtLabel: "2026-03-21",
        value: "Projeler",
      },
    });

    expect(state.localeForm).toMatchObject({
      editingCode: "tr",
      isOpen: false,
      mode: null,
    });
    expect(state.translationForm).toEqual({
      editingKey: "dashboard.layout.navProjects",
      editingLocale: "tr",
      errors: undefined,
      isOpen: true,
      mode: "edit",
      values: {
        key: "dashboard.layout.navProjects",
        locale: "tr",
        value: "Projeler",
      },
    });
  });

  it("prefers action form state over loader form state when present", () => {
    expect(
      mergeDashboardResourcesLocaleFormState(
        {
          editingCode: null,
          isOpen: false,
          mode: null,
          values: {
            code: "",
            isActive: "true",
            isDefault: "false",
            label: "",
            sortOrder: "0",
          },
        },
        {
          localeForm: {
            editingCode: "tr",
            errors: {
              code: "Already used",
            },
            isOpen: true,
            mode: "edit",
            values: {
              code: "tr",
              isActive: "true",
              isDefault: "true",
              label: "Turkish",
              sortOrder: "0",
            },
          },
        },
      ),
    ).toMatchObject({
      editingCode: "tr",
      errors: {
        code: "Already used",
      },
    });
    expect(
      mergeDashboardResourcesTranslationFormState(
        {
          editingKey: null,
          editingLocale: null,
          isOpen: false,
          mode: null,
          values: {
            key: "",
            locale: "tr",
            value: "",
          },
        },
        undefined,
      ),
    ).toMatchObject({
      editingKey: null,
      editingLocale: null,
      isOpen: false,
      mode: null,
    });
  });
});
