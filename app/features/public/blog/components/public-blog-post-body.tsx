import { Fragment, createElement, type ReactNode } from "react";

import {
  coercePostContentDocument,
  sanitizePostLinkHref,
  type PostContentMark,
  type PostContentNode,
} from "~/features/posts/post-content.shared";

function getNodeText(node: PostContentNode): string {
  const directText = node.text ?? "";
  const childText = (node.content ?? []).map((child) => getNodeText(child)).join("");

  return `${directText}${childText}`;
}

function renderMarkedText(text: string, marks: PostContentMark[] = []) {
  return marks.reduce<ReactNode>((content, mark, index) => {
    switch (mark.type) {
      case "bold":
        return <strong key={`bold-${index}`}>{content}</strong>;
      case "italic":
        return <em key={`italic-${index}`}>{content}</em>;
      case "underline":
        return (
          <span
            key={`underline-${index}`}
            className="underline decoration-2 underline-offset-4"
          >
            {content}
          </span>
        );
      case "code":
        return <code key={`code-${index}`}>{content}</code>;
      case "link": {
        const href =
          typeof mark.attrs?.href === "string"
            ? sanitizePostLinkHref(mark.attrs.href)
            : null;

        if (!href) {
          return content;
        }

        return (
          <a
            key={`link-${index}`}
            href={href}
            target="_blank"
            rel="noreferrer noopener nofollow"
            className="underline decoration-2 underline-offset-4"
          >
            {content}
          </a>
        );
      }
      default:
        return content;
    }
  }, text);
}

function renderChildren(content: PostContentNode[] | undefined) {
  return (content ?? []).map((node, index) =>
    renderNode(node, `${node.type}-${index}`),
  );
}

function renderListChildren(content: PostContentNode[] | undefined) {
  return (content ?? []).map((node, index) => {
    if (node.type === "listItem") {
      return renderNode(node, `list-item-${index}`);
    }

    return (
      <li key={`list-fallback-${index}`}>{renderNode(node, `list-child-${index}`)}</li>
    );
  });
}

function hasRenderableNode(node: PostContentNode): boolean {
  switch (node.type) {
    case "text":
      return (node.text ?? "").trim().length > 0;
    case "image":
      return typeof node.attrs?.src === "string" && node.attrs.src.trim().length > 0;
    case "hardBreak":
    case "horizontalRule":
      return true;
    default:
      return (node.content ?? []).some((child) => hasRenderableNode(child));
  }
}

function renderNode(node: PostContentNode, key: string): ReactNode {
  switch (node.type) {
    case "text":
      return (
        <Fragment key={key}>{renderMarkedText(node.text ?? "", node.marks)}</Fragment>
      );
    case "paragraph":
      return <p key={key}>{renderChildren(node.content)}</p>;
    case "heading": {
      const level =
        typeof node.attrs?.level === "number"
          ? Math.min(Math.max(node.attrs.level, 1), 3)
          : 2;

      return createElement(`h${level}`, { key }, renderChildren(node.content));
    }
    case "bulletList":
      return <ul key={key}>{renderListChildren(node.content)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderListChildren(node.content)}</ol>;
    case "listItem":
      return <li key={key}>{renderChildren(node.content)}</li>;
    case "blockquote":
      return <blockquote key={key}>{renderChildren(node.content)}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{getNodeText(node)}</code>
        </pre>
      );
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} />;
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";

      if (!src) {
        return null;
      }

      return <img key={key} src={src} alt={alt} loading="lazy" />;
    }
    default:
      return <Fragment key={key}>{renderChildren(node.content)}</Fragment>;
  }
}

export function PublicBlogPostBody({ content }: { content: string }) {
  const document = coercePostContentDocument(content);
  const hasRenderableContent = document.content.some((node) => hasRenderableNode(node));

  return (
    <div className="bg-card grid gap-6 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
      <div
        className={[
          "text-foreground font-sans text-lg leading-8",
          "[&_blockquote]:text-muted-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-black [&_blockquote]:pl-5",
          "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-1 [&_code]:font-sans [&_code]:text-sm",
          "[&_h1]:font-display [&_h1]:text-5xl [&_h1]:leading-none [&_h1]:uppercase",
          "[&_h2]:font-display [&_h2]:text-4xl [&_h2]:leading-none [&_h2]:uppercase",
          "[&_h3]:font-display [&_h3]:text-3xl [&_h3]:leading-none [&_h3]:uppercase",
          "[&_hr]:border-black",
          "[&_img]:w-full [&_img]:border-2 [&_img]:border-black",
          "[&_li]:marker:font-black",
          "[&_ol]:list-decimal [&_ol]:pl-6",
          "[&_pre]:overflow-x-auto [&_pre]:border-2 [&_pre]:border-black [&_pre]:bg-stone-950 [&_pre]:p-4 [&_pre]:text-stone-50",
          "[&_p]:leading-8",
          "[&_ul]:list-disc [&_ul]:pl-6",
        ].join(" ")}
      >
        {hasRenderableContent ? (
          document.content.map((node, index) =>
            renderNode(node, `${node.type}-${index}`),
          )
        ) : (
          <p>Yazi govdesi yakinda guncellenecek.</p>
        )}
      </div>
    </div>
  );
}
