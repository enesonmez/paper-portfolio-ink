import type { ReactNode } from "react";

interface DashboardSectionHeadingProps {
  eyebrow?: string;
  level?: 1 | 2 | 3;
  title: string;
  action?: ReactNode;
}

export function DashboardSectionHeading({
  action,
  eyebrow,
  level = 1,
  title,
}: DashboardSectionHeadingProps) {
  const HeadingTag = `h${level}` as const;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <HeadingTag className="font-display text-foreground text-5xl leading-none uppercase md:text-6xl">
          {title}
        </HeadingTag>
      </div>
      {action}
    </div>
  );
}
