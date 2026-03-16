import { cn } from "~/lib/utils";

interface DashboardStatusBadgeProps {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}

const toneClasses = {
  danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  neutral: "bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-100",
  success: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
} as const;

export function DashboardStatusBadge({
  label,
  tone = "neutral",
}: DashboardStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex border-2 border-black px-2 py-1 font-sans text-[10px] font-bold tracking-[0.14em] uppercase",
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  );
}
