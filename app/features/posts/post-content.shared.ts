type PostContentAttributeValue = boolean | number | string | null;

export interface PostContentMark {
  attrs?: Record<string, PostContentAttributeValue>;
  type: string;
}

export interface PostContentNode {
  attrs?: Record<string, PostContentAttributeValue>;
  content?: PostContentNode[];
  marks?: PostContentMark[];
  text?: string;
  type: string;
}

export interface PostContentDocument {
  content: PostContentNode[];
  type: "doc";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAttributeValue(value: unknown): value is PostContentAttributeValue {
  return (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  );
}

function hasSerializableAttributes(
  value: unknown,
): value is Record<string, PostContentAttributeValue> {
  return (
    isRecord(value) &&
    Object.values(value).every((attributeValue) => isAttributeValue(attributeValue))
  );
}

function isPostContentMark(value: unknown): value is PostContentMark {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  return value.attrs === undefined || hasSerializableAttributes(value.attrs);
}

function isPostContentNode(value: unknown): value is PostContentNode {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  if (value.attrs !== undefined && !hasSerializableAttributes(value.attrs)) {
    return false;
  }

  if (value.text !== undefined && typeof value.text !== "string") {
    return false;
  }

  if (
    value.content !== undefined &&
    (!Array.isArray(value.content) || !value.content.every((node) => isPostContentNode(node)))
  ) {
    return false;
  }

  if (
    value.marks !== undefined &&
    (!Array.isArray(value.marks) || !value.marks.every((mark) => isPostContentMark(mark)))
  ) {
    return false;
  }

  return true;
}

function createTextNode(text: string): PostContentNode {
  return {
    text,
    type: "text",
  };
}

function createParagraphNode(text = ""): PostContentNode {
  if (text.length === 0) {
    return {
      type: "paragraph",
    };
  }

  return {
    content: [createTextNode(text)],
    type: "paragraph",
  };
}

function createLegacyDocument(content: string): PostContentDocument {
  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    return createEmptyPostContentDocument();
  }

  return {
    content: trimmedContent
      .split(/\n{2,}/)
      .map((paragraph) => createParagraphNode(paragraph.replace(/\n+/g, " ").trim())),
    type: "doc",
  };
}

function collectNodeText(node: PostContentNode): string[] {
  const textParts: string[] = [];

  if (typeof node.text === "string") {
    textParts.push(node.text);
  }

  for (const childNode of node.content ?? []) {
    const childText = collectNodeText(childNode).join(" ").trim();

    if (childText.length > 0) {
      textParts.push(childText);
    }
  }

  return textParts;
}

export function createEmptyPostContentDocument(): PostContentDocument {
  return {
    content: [createParagraphNode()],
    type: "doc",
  };
}

export function serializePostContent(document: PostContentDocument): string {
  return JSON.stringify(document);
}

export function parsePostContentDocument(
  content: string,
): PostContentDocument | null {
  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    return null;
  }

  try {
    const parsedContent: unknown = JSON.parse(trimmedContent);

    if (
      isRecord(parsedContent) &&
      parsedContent.type === "doc" &&
      Array.isArray(parsedContent.content) &&
      parsedContent.content.every((node) => isPostContentNode(node))
    ) {
      return {
        content: parsedContent.content,
        type: "doc",
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function coercePostContentDocument(content: string): PostContentDocument {
  return parsePostContentDocument(content) ?? createLegacyDocument(content);
}

export function normalizePostContentValue(content: string): string {
  return serializePostContent(coercePostContentDocument(content));
}

export function getPostContentPlainText(content: string): string {
  const document = coercePostContentDocument(content);

  return document.content
    .flatMap((node) => collectNodeText(node))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function getPostContentCharacterCount(content: string): number {
  return getPostContentPlainText(content).length;
}

export function getDefaultPostContentValue(): string {
  return serializePostContent(createEmptyPostContentDocument());
}
