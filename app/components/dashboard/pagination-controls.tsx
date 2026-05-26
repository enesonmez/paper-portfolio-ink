import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";

export interface DashboardPaginationControlsProps {
  align?: "between" | "end";
  nextHref: string | null;
  nextLabel: string;
  previousHref: string | null;
  previousLabel: string;
  summary?: string;
}

export function DashboardPaginationControls({
  align = "end",
  nextHref,
  nextLabel,
  previousHref,
  previousLabel,
  summary,
}: DashboardPaginationControlsProps) {
  const to = useLocalizedPath();
  const hasNextPage = nextHref !== null;
  const hasPreviousPage = previousHref !== null;

  if (!hasNextPage && !hasPreviousPage && !summary) {
    return null;
  }

  return (
    <div
      className={[
        "flex flex-col gap-3 border-t-2 border-black pt-4 md:flex-row md:items-center",
        align === "between" ? "md:justify-between" : "md:justify-end",
      ].join(" ")}
    >
      {summary ? (
        <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.14em] uppercase">
          {summary}
        </p>
      ) : null}
      <div className="flex items-center gap-2 self-end md:self-auto">
        <Button
          asChild={hasPreviousPage}
          disabled={!hasPreviousPage}
          size="sm"
          variant="secondary"
        >
          {previousHref ? (
            <Link to={to(previousHref)}>{previousLabel}</Link>
          ) : (
            <span>{previousLabel}</span>
          )}
        </Button>
        <Button
          asChild={hasNextPage}
          disabled={!hasNextPage}
          size="sm"
          variant="secondary"
        >
          {nextHref ? (
            <Link to={to(nextHref)}>{nextLabel}</Link>
          ) : (
            <span>{nextLabel}</span>
          )}
        </Button>
      </div>
    </div>
  );
}
