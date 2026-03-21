import { describe, expect, it } from "vitest";

describe("skill form parser", () => {
  it("parses valid skill submissions into typed values", async () => {
    const { parseSkillFormData } =
      await import("../../app/lib/skills/skill-form.server");
    const formData = new FormData();

    formData.set("iconKey", "database");
    formData.set("name", "Cloudflare D1");
    formData.set("sortOrder", "3");
    formData.set(
      "summary",
      "Distributed relational data workflows for edge-hosted applications.",
    );

    expect(parseSkillFormData(formData)).toEqual({
      data: {
        iconKey: "database",
        name: "Cloudflare D1",
        sortOrder: 3,
        summary: "Distributed relational data workflows for edge-hosted applications.",
      },
    });
  });

  it("returns field-level errors for invalid skill submissions", async () => {
    const { parseSkillFormData } =
      await import("../../app/lib/skills/skill-form.server");
    const formData = new FormData();

    formData.set("iconKey", "invalid");
    formData.set("name", "!!");
    formData.set("sortOrder", "-1");
    formData.set("summary", "short");

    expect(parseSkillFormData(formData)).toEqual({
      errors: {
        iconKey: "Gecerli bir ikon sec.",
        name: "Beceri adi gecerli bir anahtar uretemedi.",
        sortOrder: "Siralama degeri 0 veya daha buyuk olmali.",
        summary: "Beceri ozeti en az 12 karakter olmali.",
      },
      values: {
        iconKey: "workflow",
        name: "!!",
        sortOrder: "-1",
        summary: "short",
      },
    });
  });
});
