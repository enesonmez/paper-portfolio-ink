import type { AppLoadContext } from "react-router";
import type * as ResourceFormServerModule from "~/lib/resources/resources-form.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cacheDeleteMock,
  cacheGetMock,
  cacheSetMock,
  createLocaleMock,
  createTranslationMock,
  deleteLocaleMock,
  deleteTranslationMock,
  findTranslationMock,
  listLocalesMock,
  listTranslationsByLocaleMock,
  parseLocaleFormDataMock,
  parseTranslationFormDataMock,
  requireSessionMock,
  updateLocaleMock,
  updateTranslationMock,
} = vi.hoisted(() => ({
  cacheDeleteMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
  createLocaleMock: vi.fn(),
  createTranslationMock: vi.fn(),
  deleteLocaleMock: vi.fn(),
  deleteTranslationMock: vi.fn(),
  findTranslationMock: vi.fn(),
  listLocalesMock: vi.fn(),
  listTranslationsByLocaleMock: vi.fn(),
  parseLocaleFormDataMock: vi.fn(),
  parseTranslationFormDataMock: vi.fn(),
  requireSessionMock: vi.fn(),
  updateLocaleMock: vi.fn(),
  updateTranslationMock: vi.fn(),
}));

vi.mock("~/lib/resources/resources.server", () => ({
  createLocale: createLocaleMock,
  createTranslation: createTranslationMock,
  deleteLocale: deleteLocaleMock,
  deleteTranslation: deleteTranslationMock,
  findTranslation: findTranslationMock,
  isResourceForeignKeyConstraintError: (error: unknown) =>
    error instanceof Error && error.message.includes("FOREIGN KEY"),
  isUniqueLocaleConstraintError: (error: unknown) =>
    error instanceof Error &&
    error.message.includes("UNIQUE constraint failed: locales.code"),
  isUniqueTranslationConstraintError: (error: unknown) =>
    error instanceof Error &&
    error.message.includes(
      "UNIQUE constraint failed: translations.locale, translations.key",
    ),
  listLocales: listLocalesMock,
  listTranslationsByLocale: listTranslationsByLocaleMock,
  updateLocale: updateLocaleMock,
  updateTranslation: updateTranslationMock,
}));

vi.mock("~/lib/resources/resources-form.server", async () => {
  const actual = await vi.importActual<typeof ResourceFormServerModule>(
    "~/lib/resources/resources-form.server",
  );

  return {
    ...actual,
    parseLocaleFormData: parseLocaleFormDataMock,
    parseTranslationFormData: parseTranslationFormDataMock,
  };
});

vi.mock("~/shared/auth/session.server", () => ({
  requireSession: requireSessionMock,
}));

describe("dashboard resources server", () => {
  const context = {
    cache: {
      delete: cacheDeleteMock,
      get: cacheGetMock,
      set: cacheSetMock,
    },
    db: { query: {} } as never,
    runtime: { platform: "node" },
  } as unknown as AppLoadContext;

  beforeEach(() => {
    cacheDeleteMock.mockReset();
    cacheGetMock.mockReset();
    cacheSetMock.mockReset();
    createLocaleMock.mockReset();
    createTranslationMock.mockReset();
    deleteLocaleMock.mockReset();
    deleteTranslationMock.mockReset();
    findTranslationMock.mockReset();
    listLocalesMock.mockReset();
    listTranslationsByLocaleMock.mockReset();
    parseLocaleFormDataMock.mockReset();
    parseTranslationFormDataMock.mockReset();
    requireSessionMock.mockReset();
    updateLocaleMock.mockReset();
    updateTranslationMock.mockReset();
    deleteTranslationMock.mockResolvedValue(true);
    updateTranslationMock.mockResolvedValue(true);
  }, 20000);

  it("loads locale and translation records for admin sessions", async () => {
    const { loadDashboardResourcesData } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "tr",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "TR",
        sortOrder: 0,
        translationCount: 4,
        updatedAtLabel: "2026-03-21",
      },
      {
        code: "en",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: false,
        label: "EN",
        sortOrder: 1,
        translationCount: 3,
        updatedAtLabel: "2026-03-21",
      },
    ]);
    listTranslationsByLocaleMock.mockResolvedValue({
      currentPage: 1,
      rows: [
        {
          createdAtLabel: "2026-03-21",
          key: "dashboard.layout.navProjects",
          locale: "tr",
          updatedAtLabel: "2026-03-21",
          value: "Projeler",
        },
      ],
      totalCount: 1,
    });

    const response = await loadDashboardResourcesData(
      context,
      new Request(
        "http://localhost:3000/dashboard/resources/translations?translationLocale=tr&translationSearch=jeler",
      ),
    );

    if (response instanceof Response) {
      throw new Error("Expected resources loader data");
    }

    expect(response).toMatchObject({
      access: "granted",
      metrics: {
        activeLocales: 2,
        selectedLocaleTranslations: 4,
        totalLocales: 2,
        totalTranslations: 7,
      },
      selectedTranslationLocale: "tr",
      translationPagination: {
        currentPage: 1,
        pageCount: 1,
        pageSize: 20,
        totalItems: 1,
      },
      translationSearchQuery: "jeler",
    });

    if (response.access !== "granted") {
      throw new Error("Expected granted resources loader data");
    }

    expect(response.permissions).toEqual({
      locales: {
        canCreate: true,
        canDelete: true,
        canRead: true,
        canUpdate: true,
      },
      translations: {
        canCreate: true,
        canDelete: true,
        canRead: true,
        canUpdate: true,
      },
    });
    expect(response.translations).toEqual([
      expect.objectContaining({
        key: "dashboard.layout.navProjects",
        value: "Projeler",
      }),
    ]);
    expect(listTranslationsByLocaleMock).toHaveBeenCalledWith({ query: {} }, "tr", {
      page: 1,
      pageSize: 20,
      searchQuery: "jeler",
      totalCountHint: 4,
    });
  }, 20000);

  it("keeps the selected locale count unfiltered when translation search is active", async () => {
    const { loadDashboardResourcesData } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "en",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "EN",
        sortOrder: 0,
        translationCount: 3,
        updatedAtLabel: "2026-03-21",
      },
    ]);
    listTranslationsByLocaleMock.mockResolvedValue({
      currentPage: 1,
      rows: [
        {
          createdAtLabel: "2026-03-21",
          key: "dashboard.layout.navProjects",
          locale: "en",
          updatedAtLabel: "2026-03-21",
          value: "Projects",
        },
      ],
      totalCount: 1,
    });

    const response = await loadDashboardResourcesData(
      context,
      new Request(
        "http://localhost:3000/dashboard/resources/translations?translationLocale=en&translationSearch=proj",
      ),
    );

    if (response instanceof Response || response.access !== "granted") {
      throw new Error("Expected granted resources loader data");
    }

    expect(response.metrics.selectedLocaleTranslations).toBe(3);
    expect(response.translationPagination).toEqual({
      currentPage: 1,
      pageCount: 1,
      pageSize: 20,
      totalItems: 1,
    });
    expect(response.translations).toEqual([
      expect.objectContaining({
        key: "dashboard.layout.navProjects",
      }),
    ]);
  }, 20000);

  it("loads a paginated translation page and clamps the current page to the last result page", async () => {
    const { loadDashboardResourcesData } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "en",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "EN",
        sortOrder: 0,
        translationCount: 41,
        updatedAtLabel: "2026-03-21",
      },
    ]);
    listTranslationsByLocaleMock.mockResolvedValue({
      currentPage: 2,
      rows: [
        {
          createdAtLabel: "2026-03-21",
          key: "dashboard.layout.navResources",
          locale: "en",
          updatedAtLabel: "2026-03-21",
          value: "Resources",
        },
      ],
      totalCount: 21,
    });

    const response = await loadDashboardResourcesData(
      context,
      new Request(
        "http://localhost:3000/dashboard/resources/translations?translationLocale=en&translationSearch=res&translationPage=99",
      ),
    );

    if (response instanceof Response || response.access !== "granted") {
      throw new Error("Expected granted resources loader data");
    }

    expect(listTranslationsByLocaleMock).toHaveBeenCalledWith({ query: {} }, "en", {
      page: 99,
      pageSize: 20,
      searchQuery: "res",
      totalCountHint: 41,
    });
    expect(response.translationPagination).toEqual({
      currentPage: 2,
      pageCount: 2,
      pageSize: 20,
      totalItems: 21,
    });
  }, 20000);

  it("does not expose resources to non-admin sessions", async () => {
    const { loadDashboardResourcesData } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-author",
        role: "author",
      },
    });

    await expect(
      loadDashboardResourcesData(
        context,
        new Request("http://localhost:3000/dashboard/resources"),
      ),
    ).rejects.toMatchObject({
      code: "resources.read.forbidden",
      responseData: {
        access: "denied",
      },
      status: 403,
    });
  }, 20000);

  it("redirects locale-only routes into translations when only translation read access exists", async () => {
    const { loadDashboardResourcesData } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        claims: ["dashboard.access", "resources.translations.read"],
        id: "user-translator",
        role: "author",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "tr",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "TR",
        sortOrder: 0,
        translationCount: 4,
        updatedAtLabel: "2026-03-21",
      },
      {
        code: "en",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: false,
        label: "EN",
        sortOrder: 1,
        translationCount: 3,
        updatedAtLabel: "2026-03-21",
      },
    ]);

    const response = await loadDashboardResourcesData(
      context,
      new Request("http://localhost:3000/tr/dashboard/resources/locales"),
    );

    expect(response).toBeInstanceOf(Response);

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response for section fallback");
    }

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "/tr/dashboard/resources/translations?translationLocale=tr",
    );
    expect(listTranslationsByLocaleMock).not.toHaveBeenCalled();
  }, 20000);

  it("does not serialize translation data for locale-only sessions", async () => {
    const { loadDashboardResourcesData } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        claims: ["dashboard.access", "resources.locales.read"],
        id: "user-locale-operator",
        role: "author",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "tr",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "TR",
        sortOrder: 0,
        translationCount: 4,
        updatedAtLabel: "2026-03-21",
      },
      {
        code: "en",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: false,
        label: "EN",
        sortOrder: 1,
        translationCount: 3,
        updatedAtLabel: "2026-03-21",
      },
    ]);

    const response = await loadDashboardResourcesData(
      context,
      new Request(
        "http://localhost:3000/tr/dashboard/resources/locales?translationLocale=en&translationSearch=nav&modal=create-translation",
      ),
    );

    if (response instanceof Response || response.access !== "granted") {
      throw new Error("Expected granted locale-only resources loader data");
    }

    expect(findTranslationMock).not.toHaveBeenCalled();
    expect(listTranslationsByLocaleMock).not.toHaveBeenCalled();
    expect(response.selectedTranslationLocale).toBe("");
    expect(response.translationForm).toEqual({
      editingKey: null,
      editingLocale: null,
      isOpen: false,
      mode: null,
      values: {
        key: "",
        locale: "",
        value: "",
      },
    });
    expect(response.translationPagination).toEqual({
      currentPage: 1,
      pageCount: 1,
      pageSize: 20,
      totalItems: 0,
    });
    expect(response.translationSearchQuery).toBe("");
    expect(response.translations).toEqual([]);
  }, 20000);

  it("returns a code error when the submitted locale already exists", async () => {
    const { handleDashboardResourcesAction } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "tr",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "TR",
        sortOrder: 0,
        translationCount: 4,
        updatedAtLabel: "2026-03-21",
      },
    ]);
    parseLocaleFormDataMock.mockReturnValue({
      data: {
        code: "tr",
        isActive: true,
        isDefault: false,
        label: "TR",
        sortOrder: 0,
      },
    });
    createLocaleMock.mockRejectedValue(
      new Error("UNIQUE constraint failed: locales.code"),
    );

    await expect(
      handleDashboardResourcesAction(
        context,
        new Request("http://localhost:3000/dashboard/resources/locales", {
          body: new URLSearchParams({
            code: "tr",
            intent: "create-locale",
            isActive: "true",
            isDefault: "false",
            label: "TR",
            sortOrder: "0",
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        }),
      ),
    ).rejects.toMatchObject({
      code: "resources.locales.create.duplicate_code",
      responseData: {
        localeForm: {
          errors: {
            code: "Bu locale kodu zaten kayitli.",
          },
        },
      },
      status: 409,
    });
  }, 20000);

  it("returns a 403 when the session lacks the matching locale mutation claim", async () => {
    const { handleDashboardResourcesAction } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        claims: ["dashboard.access", "resources.locales.create"],
        id: "user-locale-operator",
        role: "author",
      },
    });

    await expect(
      handleDashboardResourcesAction(
        context,
        new Request("http://localhost:3000/dashboard/resources/locales", {
          body: new URLSearchParams({
            intent: "delete-locale",
            originalCode: "tr",
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        }),
      ),
    ).rejects.toMatchObject({
      code: "resources.locales.delete.forbidden",
      responseData: {
        actionError: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
      },
      status: 403,
    });
    expect(deleteLocaleMock).not.toHaveBeenCalled();
    expect(listLocalesMock).not.toHaveBeenCalled();
  }, 20000);

  it("rejects invalid resource intents before resolving dashboard access", async () => {
    const { handleDashboardResourcesAction } =
      await import("~/features/dashboard/resources/server");

    await expect(
      handleDashboardResourcesAction(
        context,
        new Request("http://localhost:3000/dashboard/resources/locales", {
          body: new URLSearchParams({
            intent: "archive-locale",
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        }),
      ),
    ).rejects.toMatchObject({
      code: "resources.mutation.invalid_intent",
      responseData: {
        actionError: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
      },
      status: 400,
    });
    expect(requireSessionMock).not.toHaveBeenCalled();
    expect(createLocaleMock).not.toHaveBeenCalled();
    expect(updateLocaleMock).not.toHaveBeenCalled();
    expect(deleteLocaleMock).not.toHaveBeenCalled();
    expect(createTranslationMock).not.toHaveBeenCalled();
    expect(updateTranslationMock).not.toHaveBeenCalled();
    expect(deleteTranslationMock).not.toHaveBeenCalled();
  }, 20000);

  it("returns a 403 when the session lacks the matching translation mutation claim", async () => {
    const { handleDashboardResourcesAction } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        claims: ["dashboard.access", "resources.translations.create"],
        id: "user-translation-operator",
        role: "author",
      },
    });

    await expect(
      handleDashboardResourcesAction(
        context,
        new Request("http://localhost:3000/dashboard/resources/translations", {
          body: new URLSearchParams({
            intent: "delete-translation",
            originalKey: "dashboard.layout.navProjects",
            originalLocale: "tr",
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        }),
      ),
    ).rejects.toMatchObject({
      code: "resources.translations.delete.forbidden",
      responseData: {
        actionError: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
      },
      status: 403,
    });
    expect(deleteTranslationMock).not.toHaveBeenCalled();
    expect(listLocalesMock).not.toHaveBeenCalled();
  }, 20000);

  it("blocks deleting the last active locale", async () => {
    const { handleDashboardResourcesAction } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "tr",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "TR",
        sortOrder: 0,
        translationCount: 4,
        updatedAtLabel: "2026-03-21",
      },
    ]);

    await expect(
      handleDashboardResourcesAction(
        context,
        new Request("http://localhost:3000/dashboard/resources/locales", {
          body: new URLSearchParams({
            intent: "delete-locale",
            originalCode: "tr",
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        }),
      ),
    ).rejects.toMatchObject({
      code: "resources.locales.delete.last_active_guard",
      responseData: {
        actionError: "Son aktif/default locale kaldirilamaz.",
      },
      status: 409,
    });
    expect(deleteLocaleMock).not.toHaveBeenCalled();
  }, 20000);

  it("updates a translation row and clears related i18n cache keys", async () => {
    const { handleDashboardResourcesAction } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "tr",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "TR",
        sortOrder: 0,
        translationCount: 4,
        updatedAtLabel: "2026-03-21",
      },
      {
        code: "en",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: false,
        label: "EN",
        sortOrder: 1,
        translationCount: 3,
        updatedAtLabel: "2026-03-21",
      },
    ]);
    parseTranslationFormDataMock.mockReturnValue({
      data: {
        key: "dashboard.layout.navResources",
        locale: "en",
        value: "Resources",
      },
    });

    const response = await handleDashboardResourcesAction(
      context,
      new Request(
        "http://localhost:3000/dashboard/resources/translations?translationLocale=tr",
        {
          body: new URLSearchParams({
            intent: "update-translation",
            key: "dashboard.layout.navResources",
            locale: "en",
            originalKey: "dashboard.layout.navProjects",
            originalLocale: "tr",
            value: "Resources",
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        },
      ),
    );

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response after translation update");
    }

    expect(updateTranslationMock).toHaveBeenCalledWith(
      { query: {} },
      "tr",
      "dashboard.layout.navProjects",
      {
        key: "dashboard.layout.navResources",
        locale: "en",
        value: "Resources",
      },
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "/tr/dashboard/resources/translations?translationLocale=en",
    );
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/i18n/locales",
    );
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/i18n/tr",
    );
    expect(cacheDeleteMock).toHaveBeenCalledWith(
      "http://localhost:3000/__cache/i18n/en",
    );
  });

  it("rejects deleting a translation that no longer exists", async () => {
    const { handleDashboardResourcesAction } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "tr",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "TR",
        sortOrder: 0,
        translationCount: 4,
        updatedAtLabel: "2026-03-21",
      },
    ]);
    deleteTranslationMock.mockResolvedValue(false);

    await expect(
      handleDashboardResourcesAction(
        context,
        new Request(
          "http://localhost:3000/dashboard/resources/translations?translationLocale=tr",
          {
            body: new URLSearchParams({
              intent: "delete-translation",
              originalKey: "dashboard.layout.navProjects",
              originalLocale: "tr",
            }),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
          },
        ),
      ),
    ).rejects.toMatchObject({
      code: "resources.translations.delete.not_found",
      responseData: {
        actionError: "Silinecek translation bulunamadi.",
      },
      status: 404,
    });
    expect(deleteTranslationMock).toHaveBeenCalledWith(
      { query: {} },
      "tr",
      "dashboard.layout.navProjects",
    );
    expect(cacheDeleteMock).not.toHaveBeenCalled();
  }, 20000);

  it("keeps the edit modal open when the source translation was removed before update", async () => {
    const { handleDashboardResourcesAction } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });
    listLocalesMock.mockResolvedValue([
      {
        code: "tr",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: true,
        label: "TR",
        sortOrder: 0,
        translationCount: 4,
        updatedAtLabel: "2026-03-21",
      },
      {
        code: "en",
        createdAtLabel: "2026-03-21",
        isActive: true,
        isDefault: false,
        label: "EN",
        sortOrder: 1,
        translationCount: 3,
        updatedAtLabel: "2026-03-21",
      },
    ]);
    parseTranslationFormDataMock.mockReturnValue({
      data: {
        key: "dashboard.layout.navResources",
        locale: "en",
        value: "Resources",
      },
    });
    updateTranslationMock.mockResolvedValue(false);

    await expect(
      handleDashboardResourcesAction(
        context,
        new Request(
          "http://localhost:3000/dashboard/resources/translations?translationLocale=tr",
          {
            body: new URLSearchParams({
              intent: "update-translation",
              key: "dashboard.layout.navResources",
              locale: "en",
              originalKey: "dashboard.layout.navProjects",
              originalLocale: "tr",
              value: "Resources",
            }),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
          },
        ),
      ),
    ).rejects.toMatchObject({
      code: "resources.translations.update.not_found",
      responseData: {
        translationForm: {
          editingKey: "dashboard.layout.navProjects",
          editingLocale: "tr",
          errors: {
            form: "Guncellenecek translation bulunamadi.",
          },
          isOpen: true,
          mode: "edit",
          values: {
            key: "dashboard.layout.navResources",
            locale: "en",
            value: "Resources",
          },
        },
      },
      status: 404,
    });
    expect(updateTranslationMock).toHaveBeenCalledWith(
      { query: {} },
      "tr",
      "dashboard.layout.navProjects",
      {
        key: "dashboard.layout.navResources",
        locale: "en",
        value: "Resources",
      },
    );
    expect(cacheDeleteMock).not.toHaveBeenCalled();
  }, 20000);

  it("redirects back into the renamed locale when the current locale code changes", async () => {
    const { handleDashboardResourcesAction } =
      await import("~/features/dashboard/resources/server");

    requireSessionMock.mockResolvedValue({
      user: {
        id: "user-admin",
        role: "admin",
      },
    });

    listLocalesMock
      .mockResolvedValueOnce([
        {
          code: "en",
          createdAtLabel: "2026-03-21",
          isActive: true,
          isDefault: false,
          label: "EN",
          sortOrder: 1,
          translationCount: 3,
          updatedAtLabel: "2026-03-21",
        },
        {
          code: "tr",
          createdAtLabel: "2026-03-21",
          isActive: true,
          isDefault: true,
          label: "TR",
          sortOrder: 0,
          translationCount: 4,
          updatedAtLabel: "2026-03-21",
        },
      ])
      .mockResolvedValueOnce([
        {
          code: "en-gb",
          createdAtLabel: "2026-03-21",
          isActive: true,
          isDefault: false,
          label: "EN-GB",
          sortOrder: 1,
          translationCount: 3,
          updatedAtLabel: "2026-03-21",
        },
        {
          code: "tr",
          createdAtLabel: "2026-03-21",
          isActive: true,
          isDefault: true,
          label: "TR",
          sortOrder: 0,
          translationCount: 4,
          updatedAtLabel: "2026-03-21",
        },
      ]);

    parseLocaleFormDataMock.mockReturnValue({
      data: {
        code: "en-gb",
        isActive: true,
        isDefault: false,
        label: "EN-GB",
        sortOrder: 1,
      },
    });

    const response = await handleDashboardResourcesAction(
      context,
      new Request("http://localhost:3000/en/dashboard/resources/locales", {
        body: new URLSearchParams({
          code: "en-gb",
          intent: "update-locale",
          isActive: "true",
          isDefault: "false",
          label: "EN-GB",
          originalCode: "en",
          sortOrder: "1",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      }),
    );

    if (!(response instanceof Response)) {
      throw new Error("Expected redirect response after locale update");
    }

    expect(updateLocaleMock).toHaveBeenCalledWith(
      { query: {} },
      "en",
      {
        code: "en-gb",
        isActive: true,
        isDefault: false,
        label: "EN-GB",
        sortOrder: 1,
      },
      {
        promotedDefaultCode: undefined,
      },
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/en-gb/dashboard/resources/locales");
  }, 20000);
});
