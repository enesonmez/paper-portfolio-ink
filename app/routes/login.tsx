import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import {
  hasParsedLoginData,
  normalizeRedirectTarget,
  parseLoginFormData,
  signInWithEmail,
  type LoginFormState,
} from "../lib/auth/login.server";
import { getSessionForRequest } from "../lib/auth/session.server";
import type { Route } from "./+types/login";

export function meta() {
  return [
    { title: "Dashboard girisi | Enes Ink" },
    {
      name: "description",
      content: "Yonetim paneline erisim icin Better Auth ile korunan giris sayfasi.",
    },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await getSessionForRequest(request, context);
  const redirectTo = normalizeRedirectTarget(
    new URL(request.url).searchParams.get("redirectTo"),
  );

  if (session) {
    return redirect(redirectTo);
  }

  return {
    redirectTo,
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseLoginFormData(formData);

  if (!hasParsedLoginData(submission)) {
    return data(submission, {
      status: 400,
    });
  }

  return signInWithEmail({
    context,
    request,
    submission: submission.data,
  });
}

interface LoginScreenProps extends LoginFormState {
  isSubmitting?: boolean;
}

export function LoginScreen({
  errors,
  isSubmitting = false,
  values,
}: LoginScreenProps) {
  return (
    <main className="bg-background relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--color-border)_0.6px,transparent_0.6px)] [background-size:20px_20px] opacity-[0.06] dark:opacity-[0.04]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="dark:border-primary absolute top-8 left-6 h-24 w-24 rotate-12 border-4 border-black md:top-12 md:left-10 md:h-32 md:w-32" />
        <div className="dark:border-primary absolute right-8 bottom-16 h-40 w-40 -rotate-12 border-2 border-black md:right-14 md:bottom-20 md:h-64 md:w-64" />
        <div className="dark:bg-primary absolute top-[42%] left-[18%] h-4 w-4 rotate-45 bg-black" />
      </div>

      <header className="dark:border-primary relative z-10 border-b-2 border-black bg-white px-4 py-4 md:px-6 dark:bg-stone-900">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary border-2 border-black px-3 py-2 text-lg leading-none text-black">
              &gt;_
            </div>
            <p className="text-foreground font-sans text-base font-bold tracking-[0.08em] uppercase md:text-lg">
              Paper Enes Ink{" "}
              <span className="dark:bg-primary bg-black px-2 py-1 text-xs text-white dark:text-black">
                Admin
              </span>
            </p>
          </div>
          <Link
            to="/"
            className="dark:focus-visible:outline-primary font-sans text-xs font-bold tracking-[0.12em] uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            Return_To_Site
          </Link>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 md:px-6 md:py-14">
        <div className="dark:border-primary w-full max-w-md border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:bg-stone-900 dark:shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]">
          <div className="mb-8">
            <p className="dark:border-primary dark:bg-primary mb-4 inline-flex border-2 border-black bg-black px-3 py-1 font-sans text-[10px] font-bold tracking-[0.28em] text-white uppercase dark:text-black">
              Security Level: Alpha
            </p>
            <h1 className="font-display text-foreground text-5xl leading-[0.9] uppercase md:text-6xl">
              Access Granted <span className="bg-primary px-2 text-black">Only</span> To
              Admins
            </h1>
            <p className="text-muted-foreground mt-4 font-sans text-sm leading-6 tracking-[0.08em] uppercase">
              Session monitoring active. Unauthorized attempts will be logged.
            </p>
          </div>

          <Form method="post" className="space-y-6" replace>
            <input type="hidden" name="redirectTo" value={values.redirectTo} />

            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="font-sans text-xs font-bold tracking-[0.18em] uppercase"
              >
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={values.email}
                placeholder="ADMIN_USER@INK.DEV"
                aria-invalid={errors?.email ? true : undefined}
                aria-describedby={errors?.email ? "email-error" : undefined}
                className="text-foreground placeholder:text-muted-foreground dark:border-primary dark:focus-visible:outline-primary min-h-14 border-2 border-black bg-white px-4 py-3 font-sans text-base tracking-[0.05em] uppercase outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-stone-800"
              />
              {errors?.email ? (
                <p
                  id="email-error"
                  className="bg-destructive text-destructive-foreground dark:border-primary border-2 border-black px-3 py-2 font-sans text-sm"
                  role="alert"
                >
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="password"
                className="font-sans text-xs font-bold tracking-[0.18em] uppercase"
              >
                Parola
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={errors?.password ? true : undefined}
                aria-describedby={errors?.password ? "password-error" : undefined}
                className="text-foreground placeholder:text-muted-foreground dark:border-primary dark:focus-visible:outline-primary min-h-14 border-2 border-black bg-white px-4 py-3 font-sans text-base tracking-[0.05em] uppercase outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-stone-800"
              />
              {errors?.password ? (
                <p
                  id="password-error"
                  className="bg-destructive text-destructive-foreground dark:border-primary border-2 border-black px-3 py-2 font-sans text-sm"
                  role="alert"
                >
                  {errors.password}
                </p>
              ) : null}
            </div>

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
                {isSubmitting ? "Logging_In..." : "Login_To_Terminal"}
              </button>
            </div>
          </Form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="dark:bg-primary/30 h-0.5 w-12 bg-black/20" />
            <p className="text-muted-foreground font-sans text-[10px] tracking-[0.18em] uppercase">
              HttpOnly / Secure / SameSite=Lax
            </p>
          </div>
        </div>
      </section>

      <footer className="dark:border-primary relative z-10 border-t-2 border-black bg-white px-4 py-5 md:px-6 dark:bg-stone-900">
        <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4">
          <p className="text-muted-foreground font-sans text-[10px] leading-relaxed tracking-[0.16em] uppercase">
            Build: v2.4.2-stable
            <br />
            Node: TR-IST-01
          </p>
          <div className="flex gap-2">
            <span className="dark:bg-primary h-3.5 w-3.5 bg-black" />
            <span className="bg-primary h-3.5 w-3.5 border border-black" />
            <span className="dark:border-primary h-3.5 w-3.5 border-2 border-black" />
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  const { redirectTo } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const formState =
    actionData && typeof actionData === "object" && "values" in actionData
      ? (actionData as LoginFormState)
      : undefined;

  return (
    <LoginScreen
      errors={formState?.errors}
      isSubmitting={navigation.state === "submitting"}
      values={{
        email: formState?.values.email ?? "",
        redirectTo: formState?.values.redirectTo ?? redirectTo,
      }}
    />
  );
}
