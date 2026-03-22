import { describe, expect, it } from "vitest";

import {
  loadI18nPayload,
  loadSupportedLocales,
} from "../../app/shared/i18n/i18n.server";
import { locales, translations } from "../../db/schema";

function createTableAwareDb(options: {
  localesRows?: Array<{ code: string; isDefault: boolean; label: string }>;
  missingTable?: "locales" | "translations";
}) {
  return {
    select() {
      return {
        from(table: unknown) {
          if (options.missingTable === "locales" && table === locales) {
            throw new Error("no such table: locales");
          }

          if (options.missingTable === "translations" && table === translations) {
            throw new Error("no such table: translations");
          }

          return {
            orderBy() {
              if (table === locales) {
                return options.localesRows ?? [];
              }

              return [];
            },
            where() {
              return {
                orderBy() {
                  return [];
                },
              };
            },
          };
        },
      };
    },
  };
}

describe("i18n server", () => {
  it("falls back to seeded locales when the locales table is not migrated yet", async () => {
    const request = new Request("http://localhost:3000/");

    await expect(
      loadSupportedLocales(
        {
          db: createTableAwareDb({
            missingTable: "locales",
          }),
          runtime: { platform: "cloudflare" },
        } as never,
        request,
      ),
    ).resolves.toEqual([
      {
        code: "tr",
        isDefault: true,
        label: "TR",
      },
      {
        code: "en",
        isDefault: false,
        label: "EN",
      },
    ]);
  });

  it("falls back to seeded messages when the translations table is not migrated yet", async () => {
    const request = new Request("http://localhost:3000/en/blog");

    const payload = await loadI18nPayload(
      {
        db: createTableAwareDb({
          localesRows: [
            {
              code: "tr",
              isDefault: true,
              label: "TR",
            },
            {
              code: "en",
              isDefault: false,
              label: "EN",
            },
          ],
          missingTable: "translations",
        }),
        runtime: { platform: "cloudflare" },
      } as never,
      request,
    );

    expect(payload).toMatchObject({
      locale: "en",
      supportedLocales: [
        {
          code: "tr",
          isDefault: true,
          label: "TR",
        },
        {
          code: "en",
          isDefault: false,
          label: "EN",
        },
      ],
    });

    expect(payload.messages["site.title.blog"]).toBe("Blog | Enes Ink");
  });
});
