import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "destructive" | "warning";
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = "destructive",
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCancel();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      className={cn(
        "bg-card fixed inset-0 m-auto w-full max-w-md border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        "backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        "open:animate-in open:fade-in open:zoom-in-95 open:duration-200",
        "focus-visible:outline-none",
      )}
    >
      <button
        type="button"
        onClick={onCancel}
        aria-label="Close"
        className="absolute top-4 right-4 flex size-8 items-center justify-center border-2 border-black bg-stone-100 text-black hover:bg-stone-200 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none dark:bg-stone-800 dark:text-white dark:hover:bg-stone-700"
      >
        <X className="size-4" />
      </button>

      <div className="space-y-4">
        <div>
          <h3
            id="confirm-modal-title"
            className="font-display text-3xl leading-none font-bold text-black uppercase dark:text-white"
          >
            {title}
          </h3>
          <p
            id="confirm-modal-description"
            className="mt-3 font-sans text-sm font-bold text-stone-600 dark:text-stone-300"
          >
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="w-full border-2 border-black font-sans font-bold hover:bg-stone-100 sm:w-auto dark:hover:bg-stone-800"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            className={cn(
              "w-full border-2 border-black font-sans font-bold sm:w-auto",
              variant === "warning" && "bg-yellow-400 text-black hover:bg-yellow-500",
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
