import type * as I18nServerModule from "~/shared/i18n/i18n.server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadI18nRuntimeStateMock, parseLocaleFormDataMock } = vi.hoisted(() => ({
  loadI18nRuntimeStateMock: vi.fn(),
  parseLocaleFormDataMock: vi.fn(),
}));

vi.mock("~/shared/i18n/i18n.server", async () => {
  const actual = await vi.importActual<typeof I18nServerModule>(
    "~/shared/i18n/i18n.server",
  );

  return {
    ...actual,
    loadI18nRuntimeState: loadI18nRuntimeStateMock,
    parseLocaleFormData: parseLocaleFormDataMock,
  };
});

describe("locale route modules", () => {
  beforeEach(() => {
    loadI18nRuntimeStateMock.mockReset();
    parseLocaleFormDataMock.mockReset();
  });

  it("accepts supported locale prefixes and lowercases the loader result", async () => {
    loadI18nRuntimeStateMock.mockResolvedValue({
      supportedLocaleCodes: ["tr", "en"],
    });

    const { loader } = await import("~/routes/locale/layout");

    await expect(
      loader({
        context: { db: { query: {} }, runtime: { platform: "node" } },
        params: { locale: "TR" },
        request: new Request("https://paper-portfolio-ink.dev/tr"),
      } as never),
    ).resolves.toEqual({
      locale: "tr",
    });
  });

  it("rejects unsupported locale prefixes with a 404-like error contract", async () => {
    loadI18nRuntimeStateMock.mockResolvedValue({
      supportedLocaleCodes: ["tr", "en"],
    });

    const { loader } = await import("~/routes/locale/layout");

    await expect(
      loader({
        context: { db: { query: {} }, runtime: { platform: "node" } },
        params: { locale: "de" },
        request: new Request("https://paper-portfolio-ink.dev/de"),
      } as never),
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("redirects locale index and locale action requests using the runtime state", async () => {
    loadI18nRuntimeStateMock
      .mockResolvedValueOnce({
        locale: "en",
      })
      .mockResolvedValueOnce({
        defaultLocale: "tr",
        supportedLocaleCodes: ["tr", "en"],
        supportedLocales: [
          { code: "tr", label: "Turkish" },
          { code: "en", label: "English" },
        ],
      })
      .mockResolvedValueOnce({
        defaultLocale: "tr",
        supportedLocaleCodes: ["tr", "en"],
        supportedLocales: [
          { code: "tr", label: "Turkish" },
          { code: "en", label: "English" },
        ],
      });
    parseLocaleFormDataMock.mockReturnValueOnce(null).mockReturnValueOnce({
      locale: "en",
      redirectTo: "/en/projects",
    });

    const { loader } = await import("~/routes/locale/index");
    const { action } = await import("~/routes/locale/action");

    const indexResponse = await loader({
      context: { db: { query: {} }, runtime: { platform: "node" } },
      params: { locale: "en" },
      request: new Request("https://paper-portfolio-ink.dev/en"),
    } as never);
    const fallbackActionResponse = await action({
      context: { db: { query: {} }, runtime: { platform: "node" } },
      params: {},
      request: new Request("https://paper-portfolio-ink.dev/locale", {
        body: new FormData(),
        headers: {
          origin: "https://paper-portfolio-ink.dev",
        },
        method: "POST",
      }),
    } as never);
    const validActionResponse = await action({
      context: { db: { query: {} }, runtime: { platform: "node" } },
      params: {},
      request: new Request("https://paper-portfolio-ink.dev/locale", {
        body: new FormData(),
        headers: {
          origin: "https://paper-portfolio-ink.dev",
        },
        method: "POST",
      }),
    } as never);

    expect(indexResponse.status).toBe(302);
    expect(indexResponse.headers.get("location")).toBe("/en");
    expect(indexResponse.headers.get("set-cookie")).toContain("paper-locale=en");

    expect(fallbackActionResponse.status).toBe(302);
    expect(fallbackActionResponse.headers.get("location")).toBe("/tr");
    expect(fallbackActionResponse.headers.get("set-cookie")).toContain(
      "paper-locale=tr",
    );

    expect(validActionResponse.status).toBe(302);
    expect(validActionResponse.headers.get("location")).toBe("/en/projects");
    expect(validActionResponse.headers.get("set-cookie")).toContain("paper-locale=en");
  });

  it("rejects locale mutations without a same-origin header", async () => {
    const { action } = await import("~/routes/locale/action");

    await expect(
      action({
        context: { db: { query: {} }, runtime: { platform: "node" } },
        params: {},
        request: new Request("https://paper-portfolio-ink.dev/locale", {
          body: new FormData(),
          method: "POST",
        }),
      } as never),
    ).rejects.toMatchObject({
      code: "security.csrf.invalid_origin",
      status: 403,
    });

    expect(parseLocaleFormDataMock).not.toHaveBeenCalled();
  });
});
