import { Form } from "react-router";

import { LOGIN_COPY } from "../login.constants";
import type { LoginFormState } from "../login.shared";

interface LoginFormCardProps extends LoginFormState {
  isSubmitting: boolean;
}

interface LoginFieldProps {
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  id: string;
  label: string;
  name: string;
  placeholder: string;
  type: "email" | "password";
}

function LoginField({
  autoComplete,
  defaultValue,
  error,
  id,
  label,
  name,
  placeholder,
  type,
}: LoginFieldProps) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="font-sans text-xs font-bold tracking-[0.18em] uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="text-foreground placeholder:text-muted-foreground dark:border-primary dark:focus-visible:outline-primary min-h-14 border-2 border-black bg-white px-4 py-3 font-sans text-base tracking-[0.05em] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-stone-800"
      />
      {error ? (
        <p
          id={`${id}-error`}
          className="bg-destructive text-destructive-foreground dark:border-primary border-2 border-black px-3 py-2 font-sans text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function LoginFormCard({
  errors,
  isSubmitting,
  values,
}: LoginFormCardProps) {
  return (
    <div className="dark:border-primary w-full max-w-md border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:bg-stone-900 dark:shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]">
      <div className="mb-8">
        <p className="dark:border-primary dark:bg-primary mb-4 inline-flex border-2 border-black bg-black px-3 py-1 font-sans text-[10px] font-bold tracking-[0.28em] text-white uppercase dark:text-black">
          {LOGIN_COPY.securityLevel}
        </p>
        <h1 className="font-display text-foreground text-5xl leading-[0.9] uppercase md:text-6xl">
          {LOGIN_COPY.heading}{" "}
          <span className="bg-primary px-2 text-black">
            {LOGIN_COPY.headingHighlight}
          </span>{" "}
          {LOGIN_COPY.headingTail}
        </h1>
        <p className="text-muted-foreground mt-4 font-sans text-sm leading-6 tracking-[0.08em] uppercase">
          {LOGIN_COPY.securityDescription}
        </p>
      </div>

      <Form method="post" className="space-y-6" replace>
        <input type="hidden" name="redirectTo" value={values.redirectTo} />

        <LoginField
          autoComplete="email"
          defaultValue={values.email}
          error={errors?.email}
          id="email"
          label={LOGIN_COPY.emailLabel}
          name="email"
          placeholder={LOGIN_COPY.emailPlaceholder}
          type="email"
        />

        <LoginField
          autoComplete="current-password"
          error={errors?.password}
          id="password"
          label={LOGIN_COPY.passwordLabel}
          name="password"
          placeholder="••••••••"
          type="password"
        />

        {errors?.form ? (
          <p
            className="bg-destructive text-destructive-foreground dark:border-primary border-2 border-black px-3 py-2 font-sans text-sm"
            role="alert"
          >
            {errors.form}
          </p>
        ) : null}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary disabled:bg-primary/70 dark:focus-visible:outline-primary w-full border-2 border-black px-5 py-4 font-sans text-2xl font-bold tracking-[0.08em] text-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:translate-x-0 disabled:translate-y-0 disabled:text-black/70 dark:border-black dark:shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]"
          >
            {isSubmitting ? LOGIN_COPY.buttonSubmitting : LOGIN_COPY.buttonIdle}
          </button>
        </div>
      </Form>

      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="dark:bg-primary/30 h-0.5 w-12 bg-black/20" />
        <p className="text-muted-foreground font-sans text-[10px] tracking-[0.18em] uppercase">
          {LOGIN_COPY.footerSecurity}
        </p>
      </div>
    </div>
  );
}
