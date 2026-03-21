import type { ReactNode } from "react";

import { X } from "lucide-react";
import { Link } from "react-router";

import { useT } from "~/features/i18n/i18n-react";
import { cn } from "~/lib/utils";

interface DashboardModalProps {
  children: ReactNode;
  description?: string;
  title: string;
  to: string;
}

export function DashboardModal({
  children,
  description,
  title,
  to,
}: DashboardModalProps) {
  const t = useT();

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/55 p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <Link
        to={to}
        aria-label={t("aria.dashboardModal.closeOverlay")}
        className="absolute inset-0"
      />
      <section
        className={cn(
          "bg-card relative z-10 w-full max-w-4xl border-2 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:p-6 dark:shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]",
          "max-h-[calc(100vh-2rem)] overflow-y-auto md:max-h-[calc(100vh-4rem)]",
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
              {t("dashboard.modal.eyebrow")}
            </p>
            <h2 className="font-display text-foreground text-5xl leading-none uppercase">
              {title}
            </h2>
            {description ? (
              <p className="text-muted-foreground mt-3 max-w-2xl font-sans text-sm font-bold">
                {description}
              </p>
            ) : null}
          </div>
          <Link
            to={to}
            aria-label={t("aria.dashboardModal.close")}
            className="bg-card text-foreground flex size-10 shrink-0 items-center justify-center border-2 border-black"
          >
            <X className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {children}
      </section>
    </div>
  );
}
