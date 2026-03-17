import { lazy, Suspense, useSyncExternalStore } from "react";

import { DASHBOARD_POSTS_FORM_COPY } from "../dashboard-posts.constants";
import { cn } from "~/lib/utils";

interface DashboardPostsEditorProps {
  initialContent: string;
  inputName: string;
  variant?: "fullscreen" | "modal";
}

interface DashboardPostsRichTextSurfaceProps {
  initialContent: string;
  inputName: string;
  variant: "fullscreen" | "modal";
}

const DashboardPostsRichTextSurface = lazy(async () => {
  const module = await import("./dashboard-posts-rich-text-surface");

  return {
    default: module.DashboardPostsRichTextSurface,
  };
});

function EditorFallback() {
  return (
    <div className="px-6 py-10 font-sans text-sm font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
      {DASHBOARD_POSTS_FORM_COPY.editor.loadingLabel}
    </div>
  );
}

export function DashboardPostsEditor({
  inputName,
  initialContent,
  variant = "modal",
}: DashboardPostsEditorProps) {
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  return (
    <div className="grid gap-3">
      <div
        className={cn(
          "overflow-hidden border-2 border-black bg-white dark:bg-stone-800",
          variant === "fullscreen"
            ? "min-h-[32rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]"
            : "min-h-[24rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]",
        )}
      >
        {isClient ? (
          <Suspense fallback={<EditorFallback />}>
            <DashboardPostsRichTextSurface
              initialContent={initialContent}
              inputName={inputName}
              variant={variant}
            />
          </Suspense>
        ) : (
          <EditorFallback />
        )}
      </div>
    </div>
  );
}

export type { DashboardPostsRichTextSurfaceProps };
