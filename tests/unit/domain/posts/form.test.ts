import { describe, expect, it } from "vitest";

import {
  createEmptyPostContentDocument,
  serializePostContent,
} from "~/domain/posts/content";
import type { PostFormState } from "~/domain/posts/form";
import { ValidationError } from "~/shared/errors/app-error.server";
import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";
import { parsePostFormData } from "~/lib/posts/post-form.server";

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
      content,
      coverImageUrl: "https://paper-portfolio-ink.dev/cover.webp",
      excerpt: "Cloudflare cache invalidation and rollout notes.",
      slug: "edge-cache-diary",
      status: "published",
      title: "Edge Cache Diary",
    });
  });

  it("throws a validation error while preserving the submitted values", () => {
    try {
      parsePostFormData(
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
      throw new Error("Expected parsePostFormData to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);

      if (!(error instanceof ValidationError) || !error.responseData) {
        throw error;
      }

      const responseData = error.responseData as PostFormState;

      expect(error.code).toBe("posts.validation");
      expect(typeof responseData.errors?.content).toBe("string");
      expect(typeof responseData.errors?.coverImageUrl).toBe("string");
      expect(typeof responseData.errors?.excerpt).toBe("string");
      expect(typeof responseData.errors?.slug).toBe("string");
      expect(typeof responseData.errors?.title).toBe("string");
      expect(responseData.values).toMatchObject({
        slug: "Bad Slug",
        status: "draft",
      });
    }
  });
});
