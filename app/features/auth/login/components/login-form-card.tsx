import { Form } from "react-router";

import { Button } from "~/components/ui/button";
import { FormError, TextField } from "~/components/ui/form-field";

import { useLoginCopy } from "../login.constants";
import type { LoginFormState } from "../login.shared";

interface LoginFormCardProps extends LoginFormState {
  isSubmitting: boolean;
}

export function LoginFormCard({ errors, isSubmitting, values }: LoginFormCardProps) {
  const copy = useLoginCopy();

  return (
    <div className="dark:border-primary w-full max-w-md border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:bg-stone-900 dark:shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]">
      <div className="mb-8">
        <p className="dark:border-primary dark:bg-primary mb-4 inline-flex border-2 border-black bg-black px-3 py-1 font-sans text-[10px] font-bold tracking-[0.28em] text-white uppercase dark:text-black">
          {copy.securityLevel}
        </p>
        <h1 className="font-display text-foreground text-5xl leading-[0.9] uppercase md:text-6xl">
          {copy.heading}{" "}
          <span className="bg-primary px-2 text-black">{copy.headingHighlight}</span>{" "}
          {copy.headingTail}
        </h1>
        <p className="text-muted-foreground mt-4 font-sans text-sm leading-6 tracking-[0.08em] uppercase">
          {copy.securityDescription}
        </p>
      </div>

      <Form method="post" className="space-y-6" replace>
        <input type="hidden" name="redirectTo" value={values.redirectTo} />

        <TextField
          autoComplete="email"
          defaultValue={values.email}
          error={errors?.email}
          inputClassName="min-h-14 text-base tracking-[0.05em]"
          label={copy.emailLabel}
          name="email"
          placeholder={copy.emailPlaceholder}
          type="email"
        />

        <TextField
          autoComplete="current-password"
          error={errors?.password}
          inputClassName="min-h-14 text-base tracking-[0.05em]"
          label={copy.passwordLabel}
          name="password"
          placeholder="••••••••"
          type="password"
        />

        <FormError message={errors?.form} />

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="xl"
            className="disabled:bg-primary/70 dark:focus-visible:outline-primary w-full tracking-[0.08em] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:text-black/70"
          >
            {isSubmitting ? copy.buttonSubmitting : copy.buttonIdle}
          </Button>
        </div>
      </Form>

      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="dark:bg-primary/30 h-0.5 w-12 bg-black/20" />
        <p className="text-muted-foreground font-sans text-[10px] tracking-[0.18em] uppercase">
          {copy.footerSecurity}
        </p>
      </div>
    </div>
  );
}
