import type { ComponentProps, ReactNode } from "react";

import { cn } from "~/lib/utils";

const fieldLabelClassName =
  "font-sans text-xs font-bold tracking-[0.18em] uppercase";
const fieldErrorClassName =
  "bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 font-sans text-sm";
const fieldBaseClassName =
  "dark:focus-visible:outline-primary w-full min-w-0 border-2 border-black bg-white px-4 py-3 font-sans text-sm font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-stone-800";

interface FieldShellProps {
  children: ReactNode;
}

function FieldShell({ children }: FieldShellProps) {
  return <div className="grid gap-2">{children}</div>;
}

interface FieldLabelProps {
  children: ReactNode;
  htmlFor: string;
}

function FieldLabel({ children, htmlFor }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={fieldLabelClassName}>
      {children}
    </label>
  );
}

interface FieldErrorProps {
  id: string;
  message?: string;
}

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className={fieldErrorClassName} role="alert">
      {message}
    </p>
  );
}

interface BaseFieldProps {
  error?: string;
  inputClassName?: string;
  label: string;
  name: string;
}

type TextFieldProps = BaseFieldProps &
  Omit<ComponentProps<"input">, "children" | "className" | "id" | "name">;

export function TextField({
  error,
  inputClassName,
  label,
  name,
  ...props
}: TextFieldProps) {
  const errorId = `${name}-error`;

  return (
    <FieldShell>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          fieldBaseClassName,
          "tracking-[0.04em] sm:tracking-[0.06em]",
          error ? "border-destructive" : undefined,
          inputClassName,
        )}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </FieldShell>
  );
}

type TextareaFieldProps = BaseFieldProps &
  Omit<ComponentProps<"textarea">, "children" | "className" | "id" | "name">;

export function TextareaField({
  error,
  inputClassName,
  label,
  name,
  ...props
}: TextareaFieldProps) {
  const errorId = `${name}-error`;

  return (
    <FieldShell>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <textarea
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          fieldBaseClassName,
          error ? "border-destructive" : undefined,
          inputClassName,
        )}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </FieldShell>
  );
}

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps
  extends BaseFieldProps,
    Omit<ComponentProps<"select">, "children" | "className" | "id" | "name"> {
  options: readonly SelectOption[];
}

export function SelectField({
  error,
  inputClassName,
  label,
  name,
  options,
  ...props
}: SelectFieldProps) {
  const errorId = `${name}-error`;

  return (
    <FieldShell>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <select
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          fieldBaseClassName,
          "uppercase",
          error ? "border-destructive" : undefined,
          inputClassName,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={errorId} message={error} />
    </FieldShell>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className={fieldErrorClassName} role="alert">
      {message}
    </p>
  );
}
