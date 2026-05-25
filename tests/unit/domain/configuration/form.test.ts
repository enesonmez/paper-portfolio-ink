import { describe, expect, it } from "vitest";

import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";

const t = createTranslator(getSeedMessages("tr"));

describe("account configuration form parser", () => {
  it("parses valid account configuration submissions into typed values", async () => {
    const { parseAccountConfigurationFormData } =
      await import("~/lib/configuration/configuration-form.server");
    const formData = new FormData();

    formData.set("key", "site.domainUrl");
    formData.set("value", "https://paper-portfolio-ink.dev");

    expect(parseAccountConfigurationFormData(formData, t)).toEqual({
      key: "site.domainUrl",
      value: "https://paper-portfolio-ink.dev",
    });
  });

  it("throws field-level errors for invalid account configuration submissions", async () => {
    const { parseAccountConfigurationFormData } =
      await import("~/lib/configuration/configuration-form.server");
    const formData = new FormData();

    formData.set("key", "contact.email");
    formData.set("value", "invalid-email");

    try {
      parseAccountConfigurationFormData(formData, t);
      throw new Error("Expected parseAccountConfigurationFormData to throw");
    } catch (error) {
      expect(error).toMatchObject({
        code: "settings.validation",
        responseData: {
          errors: {
            value: "Gecerli bir e-posta adresi gir.",
          },
          values: {
            key: "contact.email",
            value: "invalid-email",
          },
        },
      });
    }
  });

  it("rejects non-https URLs for public configuration fields", async () => {
    const { parseAccountConfigurationFormData } =
      await import("~/lib/configuration/configuration-form.server");
    const formData = new FormData();

    formData.set("key", "social.github");
    formData.set("value", "javascript:alert(1)");

    try {
      parseAccountConfigurationFormData(formData, t);
      throw new Error("Expected parseAccountConfigurationFormData to throw");
    } catch (error) {
      expect(error).toMatchObject({
        code: "settings.validation",
        responseData: {
          errors: {
            value: "Gecerli bir URL gir.",
          },
          values: {
            key: "social.github",
            value: "javascript:alert(1)",
          },
        },
      });
    }
  });

  it("accepts empty optional social links so they can be hidden on the public site", async () => {
    const { parseAccountConfigurationFormData } =
      await import("~/lib/configuration/configuration-form.server");
    const formData = new FormData();

    formData.set("key", "social.instagram");
    formData.set("value", "   ");

    expect(parseAccountConfigurationFormData(formData, t)).toEqual({
      key: "social.instagram",
      value: "",
    });
  });
});
