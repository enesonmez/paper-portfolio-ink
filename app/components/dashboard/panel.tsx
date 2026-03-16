import type { ComponentPropsWithoutRef } from "react";

import { cn } from "~/lib/utils";

export function DashboardPanel({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "bg-card border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]",
        className,
      )}
      {...props}
    />
  );
}
