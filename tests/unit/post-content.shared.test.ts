import { describe, expect, it } from "vitest";

import {
  coercePostContentDocument,
  getPostContentCharacterCount,
  getPostContentPlainText,
  normalizePostContentValue,
  parsePostContentDocument,
  serializePostContent,
} from "../../app/features/posts/post-content.shared";

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
    expect(getPostContentPlainText(content)).toBe("Structured editor content stays structured.");
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
});
