import { cn } from "~/lib/utils";
import type { ProjectStatusOption } from "~/features/projects/project.shared";

interface ProjectFieldProps {
  error?: string;
  label: string;
  name: string;
  placeholder: string;
  type?: "number" | "text";
  value: string;
}

export function ProjectField({
  error,
  label,
  name,
  placeholder,
  type = "text",
  value,
}: ProjectFieldProps) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={name}
        className="font-sans text-xs font-bold tracking-[0.18em] uppercase"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "dark:focus-visible:outline-primary w-full min-w-0 border-2 border-black bg-white px-4 py-3 font-sans text-sm font-bold tracking-[0.04em] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:tracking-[0.06em] dark:bg-stone-800",
          error ? "border-destructive" : undefined,
        )}
      />
      {error ? (
        <p
          id={`${name}-error`}
          className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 font-sans text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface ProjectTextareaProps {
  error?: string;
  label: string;
  name: string;
  value: string;
}

export function ProjectTextarea({
  error,
  label,
  name,
  value,
}: ProjectTextareaProps) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={name}
        className="font-sans text-xs font-bold tracking-[0.18em] uppercase"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={value}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "dark:focus-visible:outline-primary w-full min-w-0 border-2 border-black bg-white px-4 py-3 font-sans text-sm font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-stone-800",
          error ? "border-destructive" : undefined,
        )}
      />
      {error ? (
        <p
          id={`${name}-error`}
          className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 font-sans text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface ProjectSelectProps {
  error?: string;
  label: string;
  name: string;
  options: readonly ProjectStatusOption[];
  value: string;
}

export function ProjectSelect({
  error,
  label,
  name,
  options,
  value,
}: ProjectSelectProps) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={name}
        className="font-sans text-xs font-bold tracking-[0.18em] uppercase"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "dark:focus-visible:outline-primary w-full min-w-0 border-2 border-black bg-white px-4 py-3 font-sans text-sm font-bold uppercase outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-stone-800",
          error ? "border-destructive" : undefined,
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p
          id={`${name}-error`}
          className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 font-sans text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
