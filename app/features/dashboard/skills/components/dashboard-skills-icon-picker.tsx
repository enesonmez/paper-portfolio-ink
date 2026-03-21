import type { ChangeEventHandler } from "react";

import { FormError } from "~/components/ui/form-field";
import { useSkillIconOptions } from "~/features/skills/skill-icon.shared";
import { cn } from "~/lib/utils";
import type { SkillIconKey } from "~/features/skills/skill-icon.shared";

interface DashboardSkillsIconPickerProps {
  error?: string;
  name: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value: SkillIconKey;
}

export function DashboardSkillsIconPicker({
  error,
  name,
  onChange,
  value,
}: DashboardSkillsIconPickerProps) {
  const options = useSkillIconOptions();

  return (
    <fieldset className="grid gap-3">
      <legend className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
        Icon
      </legend>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          const inputId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={cn(
                "bg-card flex cursor-pointer gap-3 border-2 border-black p-3 transition-transform dark:bg-stone-800",
                value === option.value
                  ? "bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
                  : "hover:translate-x-0.5 hover:translate-y-0.5",
                error ? "border-destructive" : undefined,
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                className="sr-only"
              />
              <div className="flex size-11 shrink-0 items-center justify-center border-2 border-black bg-white dark:bg-stone-900">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="font-sans text-xs font-bold tracking-[0.14em] uppercase">
                  {option.label}
                </p>
                <p className="font-sans text-xs leading-relaxed">
                  {option.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
      <FormError message={error} />
    </fieldset>
  );
}
