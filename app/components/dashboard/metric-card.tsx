import { DashboardPanel } from "./panel";

interface DashboardMetricCardProps {
  accent?: "primary" | "surface";
  label: string;
  value: string;
  meta?: string;
}

export function DashboardMetricCard({
  accent = "surface",
  label,
  value,
  meta,
}: DashboardMetricCardProps) {
  return (
    <DashboardPanel
      className={
        accent === "primary" ? "bg-primary text-black dark:border-black" : undefined
      }
    >
      <p className="mb-2 font-sans text-xs font-bold tracking-[0.18em] uppercase opacity-70">
        {label}
      </p>
      <div className="flex items-end gap-3">
        <span className="font-display text-6xl leading-none">{value}</span>
        {meta ? (
          <span className="font-sans text-xs font-bold tracking-[0.14em] uppercase">
            {meta}
          </span>
        ) : null}
      </div>
    </DashboardPanel>
  );
}
