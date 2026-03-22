import { describe, expect, it } from "vitest";

import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";

const t = createTranslator(getSeedMessages("tr"));

describe("project form parser", () => {
  it("parses valid project submissions into typed values", async () => {
    const { parseProjectFormData } = await import("~/lib/projects/project-form.server");
    const formData = new FormData();

    formData.set("title", "Cyber Store Front");
    formData.set("slug", "cyber-store-front");
    formData.set("summary", "Edge-first commerce frontend.");
    formData.set("description", "A detailed dashboard-managed commerce project.");
    formData.set("repositoryUrl", "https://github.com/enes/cyber-store-front");
    formData.set("liveUrl", "https://cyber.paper-portfolio-ink.dev");
    formData.set(
      "coverImageUrl",
      "https://images.paper-portfolio-ink.dev/cyber-store-front.webp",
    );
    formData.set("status", "published");
    formData.set("isFeatured", "on");
    formData.set("sortOrder", "4");

    expect(parseProjectFormData(formData, t)).toEqual({
      data: {
        coverImageUrl: "https://images.paper-portfolio-ink.dev/cyber-store-front.webp",
        description: "A detailed dashboard-managed commerce project.",
        isFeatured: true,
        liveUrl: "https://cyber.paper-portfolio-ink.dev",
        repositoryUrl: "https://github.com/enes/cyber-store-front",
        slug: "cyber-store-front",
        sortOrder: 4,
        status: "published",
        summary: "Edge-first commerce frontend.",
        title: "Cyber Store Front",
      },
    });
  });

  it("returns field-level errors for invalid project submissions", async () => {
    const { parseProjectFormData } = await import("~/lib/projects/project-form.server");
    const formData = new FormData();

    formData.set("title", "A");
    formData.set("slug", "Invalid Slug");
    formData.set("summary", "");
    formData.set("status", "invalid");
    formData.set("sortOrder", "-2");

    expect(parseProjectFormData(formData, t)).toEqual({
      errors: {
        slug: "Slug sadece kucuk harf, rakam ve tire icerebilir.",
        sortOrder: "Siralama degeri 0 veya daha buyuk olmali.",
        status: "Gecerli bir yayin durumu sec.",
        summary: "Proje ozeti en az 12 karakter olmali.",
        title: "Proje basligi en az 3 karakter olmali.",
      },
      values: {
        coverImageUrl: "",
        description: "",
        isFeatured: false,
        liveUrl: "",
        repositoryUrl: "",
        slug: "Invalid Slug",
        sortOrder: "-2",
        status: "draft",
        summary: "",
        title: "A",
      },
    });
  });
});
