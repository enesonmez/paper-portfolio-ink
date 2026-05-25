import { describe, expect, it } from "vitest";

import {
  coercePostContentDocument,
  getPostContentCharacterCount,
  getPostContentPlainText,
  normalizePostContentValue,
  parsePostContentDocument,
  sanitizePostImageSrc,
  sanitizePostLinkHref,
  serializePostContent,
} from "~/domain/posts/content";

describe("post content helpers", () => {
  it("preserves valid structured tiptap content", () => {
    const content = serializePostContent({
      content: [
        {
          content: [
            {
              text: "Structured editor content stays structured.",
              type: "text",
            },
          ],
          type: "paragraph",
        },
      ],
      type: "doc",
    });

    expect(parsePostContentDocument(content)).toEqual(JSON.parse(content));
    expect(normalizePostContentValue(content)).toBe(content);
    expect(getPostContentPlainText(content)).toBe(
      "Structured editor content stays structured.",
    );
  });

  it("coerces legacy plain text into a tiptap document", () => {
    const legacyMarkdown = "# Edge rollout\n\nQueue drain before cache purge.";
    const normalizedContent = normalizePostContentValue(legacyMarkdown);
    const parsedContent = parsePostContentDocument(normalizedContent);

    expect(parsedContent).not.toBeNull();
    expect(coercePostContentDocument(legacyMarkdown).type).toBe("doc");
    expect(getPostContentPlainText(normalizedContent)).toContain("Edge rollout");
    expect(getPostContentCharacterCount(normalizedContent)).toBeGreaterThan(20);
  });

  it("allows only safe public link protocols", () => {
    expect(sanitizePostLinkHref("https://paper-portfolio-ink.dev/post")).toBe(
      "https://paper-portfolio-ink.dev/post",
    );
    expect(sanitizePostLinkHref("mailto:hello@paper-portfolio-ink.dev")).toBe(
      "mailto:hello@paper-portfolio-ink.dev",
    );
    expect(sanitizePostLinkHref("javascript:alert(1)")).toBeNull();
    expect(sanitizePostLinkHref("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("allows only safe public image sources", () => {
    expect(sanitizePostImageSrc("https://paper-portfolio-ink.dev/image.webp")).toBe(
      "https://paper-portfolio-ink.dev/image.webp",
    );
    expect(sanitizePostImageSrc("/cdn/image.webp")).toBe("/cdn/image.webp");
    expect(sanitizePostImageSrc("data:image/svg+xml,<svg></svg>")).toBeNull();
    expect(sanitizePostImageSrc("blob:https://paper-portfolio-ink.dev/id")).toBeNull();
    expect(sanitizePostImageSrc("//tracker.example/pixel.gif")).toBeNull();
  });
});
