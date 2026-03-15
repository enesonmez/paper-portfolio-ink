import { isAPIError } from "better-auth/api";
import { data, redirect, type AppLoadContext } from "react-router";
import { z } from "zod";

import { resolveAuthConfig } from "./auth-config.server";
import { createAuth } from "./auth.server";

const DASHBOARD_HOME = "/dashboard";

const loginSchema = z.object({
  email: z.string().trim().email("Gecerli bir e-posta gir."),
  password: z
    .string()
    .min(8, "Parola en az 8 karakter olmali.")
    .max(128, "Parola en fazla 128 karakter olabilir."),
  redirectTo: z.string().optional(),
});

export interface LoginSubmission {
  email: string;
  password: string;
  redirectTo: string;
}

export interface LoginFormState {
  errors?: {
    email?: string;
    password?: string;
    form?: string;
  };
  values: {
    email: string;
    redirectTo: string;
  };
}

interface SignInWithEmailOptions {
  context: AppLoadContext;
  request: Request;
  submission: LoginSubmission;
}

function readJsonField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

async function readSignInRedirect(response: Response) {
  try {
    const payload: unknown = await response.clone().json();

    if (
      payload &&
      typeof payload === "object" &&
      "url" in payload &&
      typeof payload.url === "string"
    ) {
      return payload.url;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

async function readAuthErrorPayload(response: Response) {
  try {
    const payload: unknown = await response.clone().json();

    if (payload && typeof payload === "object") {
      const message =
        "message" in payload && typeof payload.message === "string"
          ? payload.message
          : undefined;
      const code =
        "code" in payload && typeof payload.code === "string"
          ? payload.code
          : undefined;

      return {
        code,
        message,
      };
    }

    return undefined;
  } catch {
    return undefined;
  }
}

export function normalizeRedirectTarget(redirectTo?: string | null) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return DASHBOARD_HOME;
  }

  return redirectTo;
}

export function buildLoginRedirect(request: Request) {
  const url = new URL(request.url);
  const redirectTo = `${url.pathname}${url.search}`;

  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export function parseLoginFormData(formData: FormData):
  | {
      data: LoginSubmission;
    }
  | LoginFormState {
  const rawValues = {
    email: readJsonField(formData, "email"),
    password: readJsonField(formData, "password"),
    redirectTo: readJsonField(formData, "redirectTo"),
  };
  const parsed = loginSchema.safeParse(rawValues);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
      values: {
        email: rawValues.email,
        redirectTo: normalizeRedirectTarget(rawValues.redirectTo),
      },
    };
  }

  return {
    data: {
      ...parsed.data,
      redirectTo: normalizeRedirectTarget(parsed.data.redirectTo),
    },
  };
}

function hasParsedLoginData(
  submission: LoginFormState | { data: LoginSubmission },
): submission is { data: LoginSubmission } {
  return "data" in submission;
}

function resolveApiErrorStatus(error: {
  status?: string | number;
  statusCode?: number;
}) {
  if (typeof error.statusCode === "number") {
    return error.statusCode;
  }

  if (error.status === 401 || error.status === "UNAUTHORIZED") {
    return 401;
  }

  if (error.status === 400 || error.status === "BAD_REQUEST") {
    return 400;
  }

  return 500;
}

function resolveLoginErrorMessage(status: number, code?: string, message?: string) {
  if (
    status === 400 ||
    status === 401 ||
    status === 404 ||
    code === "USER_NOT_FOUND" ||
    code === "INVALID_EMAIL_OR_PASSWORD" ||
    code === "INVALID_PASSWORD" ||
    message === "User not found"
  ) {
    return "E-posta veya parola hatali.";
  }

  if (status === 403) {
    return "Bu hesap su anda giris icin hazir degil.";
  }

  return "Giris su anda tamamlanamadi.";
}

export async function signInWithEmail({
  context,
  request,
  submission,
}: SignInWithEmailOptions) {
  try {
    const auth = createAuth({
      db: context.db,
      ...resolveAuthConfig(request, context.auth),
    });
    const response = await auth.api.signInEmail({
      body: {
        callbackURL: submission.redirectTo,
        email: submission.email,
        password: submission.password,
        rememberMe: true,
      },
      headers: request.headers,
      asResponse: true,
    });

    if (!response.ok) {
      const errorPayload = await readAuthErrorPayload(response);

      return data<LoginFormState>(
        {
          errors: {
            form: resolveLoginErrorMessage(
              response.status,
              errorPayload?.code,
              errorPayload?.message,
            ),
          },
          values: {
            email: submission.email,
            redirectTo: submission.redirectTo,
          },
        },
        {
          status: response.status,
        },
      );
    }

    const redirectTarget = normalizeRedirectTarget(
      (await readSignInRedirect(response)) ?? submission.redirectTo,
    );
    const headers = new Headers(response.headers);

    return redirect(redirectTarget, {
      headers,
    });
  } catch (error) {
    if (isAPIError(error)) {
      const status = resolveApiErrorStatus(error);

      return data<LoginFormState>(
        {
          errors: {
            form: resolveLoginErrorMessage(status),
          },
          values: {
            email: submission.email,
            redirectTo: submission.redirectTo,
          },
        },
        {
          status,
        },
      );
    }

    throw error;
  }
}

export { hasParsedLoginData };
