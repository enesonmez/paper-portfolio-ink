import {
  Bold,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  RotateCcw,
  RotateCw,
  Underline as UnderlineIcon,
  Unlink,
} from "lucide-react";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

import type { DashboardPostsRichTextSurfaceProps } from "./dashboard-posts-editor";
import {
  coercePostContentDocument,
  normalizePostContentValue,
} from "~/features/posts/post-content.shared";
import { DASHBOARD_POSTS_FORM_COPY } from "../dashboard-posts.constants";
import { cn } from "~/lib/utils";

interface DashboardPostsToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps extends ComponentProps<"button"> {
  active?: boolean;
}

function ToolbarButton({
  active = false,
  className,
  type = "button",
  ...props
}: ToolbarButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex size-10 items-center justify-center border-2 border-transparent bg-transparent text-stone-700 transition-colors",
        "hover:border-black hover:bg-primary hover:text-stone-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active ? "border-black bg-primary text-stone-950" : "",
        className,
      )}
      {...props}
    />
  );
}

function DashboardPostsEditorToolbar({
  editor,
}: DashboardPostsToolbarProps) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      canRedo: currentEditor?.can().chain().focus().redo().run() ?? false,
      canUndo: currentEditor?.can().chain().focus().undo().run() ?? false,
      hasLink: currentEditor?.isActive("link") ?? false,
      isBlockquote: currentEditor?.isActive("blockquote") ?? false,
      isBold: currentEditor?.isActive("bold") ?? false,
      isBulletList: currentEditor?.isActive("bulletList") ?? false,
      isCodeBlock: currentEditor?.isActive("codeBlock") ?? false,
      isHeading1: currentEditor?.isActive("heading", { level: 1 }) ?? false,
      isHeading2: currentEditor?.isActive("heading", { level: 2 }) ?? false,
      isHeading3: currentEditor?.isActive("heading", { level: 3 }) ?? false,
      isItalic: currentEditor?.isActive("italic") ?? false,
      isOrderedList: currentEditor?.isActive("orderedList") ?? false,
      isUnderline: currentEditor?.isActive("underline") ?? false,
    }),
  });

  if (!editor || !editorState) {
    return null;
  }

  const activeEditor = editor;

  function handleSetLink() {
    const currentHref = activeEditor.getAttributes("link").href as unknown;
    const nextHref = window.prompt(
      DASHBOARD_POSTS_FORM_COPY.editor.linkPromptLabel,
      typeof currentHref === "string"
        ? currentHref
        : DASHBOARD_POSTS_FORM_COPY.editor.urlDefaultValue,
    );

    if (nextHref === null) {
      return;
    }

    const normalizedHref = nextHref.trim();

    if (normalizedHref.length === 0) {
      activeEditor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    activeEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: normalizedHref,
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      })
      .run();
  }

  function handleInsertImage() {
    const nextSource = window.prompt(
      DASHBOARD_POSTS_FORM_COPY.editor.imagePromptLabel,
      DASHBOARD_POSTS_FORM_COPY.editor.urlDefaultValue,
    );

    if (nextSource === null) {
      return;
    }

    const normalizedSource = nextSource.trim();

    if (normalizedSource.length === 0) {
      return;
    }

    activeEditor.chain().focus().setImage({ src: normalizedSource }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b-2 border-black bg-white px-4 py-3 dark:bg-stone-800">
      <div className="flex items-center gap-1 border-r-2 border-black pr-3">
        <ToolbarButton
          aria-label="Undo"
          disabled={!editorState.canUndo}
          onClick={() => activeEditor.chain().focus().undo().run()}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Redo"
          disabled={!editorState.canRedo}
          onClick={() => activeEditor.chain().focus().redo().run()}
        >
          <RotateCw className="size-4" aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 border-r-2 border-black pr-3">
        <ToolbarButton
          active={editorState.isBold}
          aria-label="Bold"
          onClick={() => activeEditor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editorState.isItalic}
          aria-label="Italic"
          onClick={() => activeEditor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editorState.isUnderline}
          aria-label="Underline"
          onClick={() => activeEditor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 border-r-2 border-black pr-3">
        <ToolbarButton
          active={editorState.isHeading1}
          aria-label="Heading 1"
          onClick={() => activeEditor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <span className="text-[11px] font-black">H1</span>
        </ToolbarButton>
        <ToolbarButton
          active={editorState.isHeading2}
          aria-label="Heading 2"
          onClick={() => activeEditor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="text-[11px] font-black">H2</span>
        </ToolbarButton>
        <ToolbarButton
          active={editorState.isHeading3}
          aria-label="Heading 3"
          onClick={() => activeEditor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <span className="text-[11px] font-black">H3</span>
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1 border-r-2 border-black pr-3">
        <ToolbarButton
          active={editorState.isBulletList}
          aria-label="Bullet List"
          onClick={() => activeEditor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editorState.isOrderedList}
          aria-label="Ordered List"
          onClick={() => activeEditor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editorState.isBlockquote}
          aria-label="Blockquote"
          onClick={() => activeEditor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          active={editorState.isCodeBlock}
          aria-label="Code Block"
          onClick={() => activeEditor.chain().focus().toggleCodeBlock().run()}
        >
          <span className="text-[11px] font-black">{"</>"}</span>
        </ToolbarButton>
        <ToolbarButton
          aria-label="Horizontal Rule"
          onClick={() => activeEditor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1">
        <ToolbarButton
          active={editorState.hasLink}
          aria-label="Set Link"
          onClick={handleSetLink}
        >
          <Link2 className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Unset Link"
          disabled={!editorState.hasLink}
          onClick={() =>
            activeEditor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          <Unlink className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Insert Image"
          onClick={handleInsertImage}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
        </ToolbarButton>
      </div>
    </div>
  );
}

export function DashboardPostsRichTextSurface({
  initialContent,
  inputName,
  variant,
}: DashboardPostsRichTextSurfaceProps) {
  const [serializedContent, setSerializedContent] = useState(() =>
    normalizePostContentValue(initialContent),
  );
  const editorClassName = useMemo(
    () =>
      cn(
        "tiptap min-h-[22rem] border-0 bg-transparent px-0 py-0 font-sans text-lg leading-8 text-stone-950 outline-none dark:text-stone-50",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-black [&_blockquote]:pl-4 [&_blockquote]:text-stone-600 dark:[&_blockquote]:text-stone-300",
        "[&_code]:bg-stone-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm dark:[&_code]:bg-stone-700",
        "[&_h1]:font-display [&_h1]:text-6xl [&_h1]:leading-none [&_h1]:uppercase",
        "[&_h2]:font-display [&_h2]:text-4xl [&_h2]:leading-none [&_h2]:uppercase",
        "[&_h3]:font-display [&_h3]:text-3xl [&_h3]:leading-none [&_h3]:uppercase",
        "[&_hr]:my-8 [&_hr]:border-t-2 [&_hr]:border-black",
        "[&_img]:my-8 [&_img]:w-full [&_img]:border-2 [&_img]:border-black",
        "[&_li]:marker:font-bold",
        "[&_ol]:list-decimal [&_ol]:pl-6",
        "[&_p.is-editor-empty:first-child::before]:pointer-events-none",
        "[&_p.is-editor-empty:first-child::before]:float-left",
        "[&_p.is-editor-empty:first-child::before]:h-0",
        "[&_p.is-editor-empty:first-child::before]:text-stone-400 dark:[&_p.is-editor-empty:first-child::before]:text-stone-500",
        "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        "[&_p]:mb-6 [&_p]:leading-8",
        "[&_pre]:overflow-x-auto [&_pre]:border-2 [&_pre]:border-black [&_pre]:bg-stone-950 [&_pre]:p-4 [&_pre]:text-stone-50",
        "[&_ul]:list-disc [&_ul]:pl-6",
        variant === "fullscreen" ? "min-h-[32rem] text-xl leading-9" : "",
      ),
    [variant],
  );
  const editorExtensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          autolink: true,
          HTMLAttributes: {
            class: "underline decoration-2 underline-offset-4",
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
          openOnClick: false,
        },
        underline: {},
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class:
            "h-auto max-w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]",
        },
      }),
      Placeholder.configure({
        placeholder: DASHBOARD_POSTS_FORM_COPY.content.placeholder,
      }),
    ],
    [],
  );
  const editor = useEditor(
    {
      content: coercePostContentDocument(initialContent),
      editorProps: {
        attributes: {
          "aria-label": "Story Body",
          class: editorClassName,
        },
      },
      extensions: editorExtensions,
      immediatelyRender: true,
      onUpdate: ({ editor: currentEditor }) => {
        setSerializedContent(normalizePostContentValue(JSON.stringify(currentEditor.getJSON())));
      },
    },
    [editorClassName, editorExtensions, initialContent, variant],
  );

  return (
    <>
      <input type="hidden" name={inputName} value={serializedContent} />
      <DashboardPostsEditorToolbar editor={editor} />
      {editor ? (
        <EditorContent
          editor={editor}
          className={cn("px-6 py-6 md:px-8", variant === "fullscreen" ? "md:px-10" : "")}
        />
      ) : (
        <div className="px-6 py-10 font-sans text-sm font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
          {DASHBOARD_POSTS_FORM_COPY.editor.loadingLabel}
        </div>
      )}
    </>
  );
}
