import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import { Button } from "~/components/ui/button";
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
    <main className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-8 md:px-6 lg:py-16">
      <section className="bg-card grid gap-6 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:grid-cols-[1.1fr_0.9fr] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
        <div className="grid content-start gap-4">
          <p className="text-muted-foreground text-sm tracking-[0.08em] uppercase">
            Better Auth / Phase 4.2
          </p>
          <h1 className="font-display text-6xl leading-none md:text-7xl">
            Dashboard girisi
          </h1>
          <p className="text-muted-foreground max-w-xl text-base leading-7 md:text-lg">
            Yonetim paneline erismek icin mevcut hesabinla giris yap. Session
            dogrulamasi server tarafinda surdurulur.
          </p>
          <div className="bg-primary text-primary-foreground inline-flex w-fit border-2 border-black px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase">
            HttpOnly / Secure / SameSite=Lax
          </div>
        </div>

        <div className="bg-background grid gap-4 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          <Form method="post" className="grid gap-4" replace>
            <input type="hidden" name="redirectTo" value={values.redirectTo} />

            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold tracking-[0.08em] uppercase"
              >
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={values.email}
                aria-invalid={errors?.email ? true : undefined}
                aria-describedby={errors?.email ? "email-error" : undefined}
                className="bg-card focus-visible:ring-primary min-h-12 border-2 border-black px-4 py-3 text-base outline-none focus-visible:ring-4"
              />
              {errors?.email ? (
                <p
                  id="email-error"
                  className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 text-sm"
                  role="alert"
                >
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold tracking-[0.08em] uppercase"
              >
                Parola
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={errors?.password ? true : undefined}
                aria-describedby={errors?.password ? "password-error" : undefined}
                className="bg-card focus-visible:ring-primary min-h-12 border-2 border-black px-4 py-3 text-base outline-none focus-visible:ring-4"
              />
              {errors?.password ? (
                <p
                  id="password-error"
                  className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 text-sm"
                  role="alert"
                >
                  {errors.password}
                </p>
              ) : null}
            </div>

            {errors?.form ? (
              <p
                className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 text-sm"
                role="alert"
              >
                {errors.form}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Giris yapiliyor" : "Giris yap"}
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/">Ana sayfaya don</Link>
              </Button>
            </div>
          </Form>
        </div>
      </section>
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
