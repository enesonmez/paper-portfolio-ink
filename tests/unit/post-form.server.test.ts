import { describe, expect, it } from "vitest";

import {
  createEmptyPostContentDocument,
  serializePostContent,
} from "../../app/features/posts/post-content.shared";
import { createTranslator, getSeedMessages } from "../../app/shared/i18n/i18n.shared";
import { parsePostFormData } from "../../app/lib/posts/post-form.server";

const t = createTranslator(getSeedMessages("tr"));

function buildFormData(entries: Array<[string, string]>) {
  const formData = new FormData();

  for (const [key, value] of entries) {
    formData.set(key, value);
  }

  return formData;
}

describe("post form parser", () => {
  it("parses a valid post submission with tiptap content", () => {
    const content = serializePostContent({
      content: [
        {
          content: [
            {
              text: "Cloudflare cache invalidation and rollout notes for production.",
              type: "text",
            },
          ],
          type: "paragraph",
        },
      ],
      type: "doc",
    });

    const submission = parsePostFormData(
      buildFormData([
        ["title", "Edge Cache Diary"],
        ["slug", "edge-cache-diary"],
        ["excerpt", "Cloudflare cache invalidation and rollout notes."],
        ["content", content],
        ["coverImageUrl", "https://paper-portfolio-ink.dev/cover.webp"],
        ["status", "published"],
        ["publishedAt", "2026-03-17"],
      ]),
      t,
    );

    expect(submission).toEqual({
      data: {
        content,
        coverImageUrl: "https://paper-portfolio-ink.dev/cover.webp",
        excerpt: "Cloudflare cache invalidation and rollout notes.",
        slug: "edge-cache-diary",
        status: "published",
        title: "Edge Cache Diary",
      },
    });
  });

  it("returns field errors while preserving the submitted values", () => {
    const submission = parsePostFormData(
      buildFormData([
        ["title", "No"],
        ["slug", "Bad Slug"],
        ["excerpt", "short"],
        ["content", serializePostContent(createEmptyPostContentDocument())],
        ["coverImageUrl", "notaurl"],
        ["status", "draft"],
      ]),
      t,
    );

    expect("data" in submission).toBe(false);

    if ("data" in submission) {
      return;
    }

    expect(submission.errors?.content).toBeTypeOf("string");
    expect(submission.errors?.coverImageUrl).toBeTypeOf("string");
    expect(submission.errors?.excerpt).toBeTypeOf("string");
    expect(submission.errors?.slug).toBeTypeOf("string");
    expect(submission.errors?.title).toBeTypeOf("string");
    expect(submission.values.slug).toBe("Bad Slug");
    expect(submission.values.status).toBe("draft");
  });
});
