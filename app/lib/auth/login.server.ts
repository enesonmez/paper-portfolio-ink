import { isAPIError } from "better-auth/api";
import { data, redirect, type AppLoadContext } from "react-router";
import { z } from "zod";

import type { LoginFormState } from "~/features/auth/login/login.shared";
import {
  buildLocaleDashboardPath,
  loadI18nRuntimeState,
} from "~/shared/i18n/i18n.server";
import {
  buildLocalizedPath,
  sanitizeLocalizedRedirectTarget,
  type AppLocale,
  type I18nTranslator,
} from "~/shared/i18n/i18n.shared";
import { findUserByEmail } from "~/lib/users/users.server";

import { resolveAuthConfig } from "./auth-config.server";
import { createAuth } from "./auth.server";

function createLoginSchema(t: I18nTranslator) {
  return z.object({
    email: z.string().trim().email(t("validation.login.email")),
    password: z
      .string()
      .min(8, t("validation.login.password.min"))
      .max(128, t("validation.login.password.max")),
    redirectTo: z.string().optional(),
  });
}

export interface LoginSubmission {
  email: string;
  password: string;
  redirectTo: string;
}

interface SignInWithEmailOptions {
  context: AppLoadContext;
  locale?: AppLocale;
  request: Request;
  submission: LoginSubmission;
  supportedLocaleCodes?: readonly string[];
  t: I18nTranslator;
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

export function normalizeRedirectTarget(
  redirectTo: string | null | undefined,
  locale: AppLocale,
  supportedLocales?: readonly string[],
) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return buildLocaleDashboardPath(locale);
  }

  return sanitizeLocalizedRedirectTarget(redirectTo, locale, supportedLocales);
}

export async function buildLoginRedirect(context: AppLoadContext, request: Request) {
  const url = new URL(request.url);
  const redirectTo = `${url.pathname}${url.search}`;
  const { locale, supportedLocaleCodes } = await loadI18nRuntimeState(context, request);

  return `${buildLocalizedPath(locale, "/login", supportedLocaleCodes)}?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export function parseLoginFormData(
  formData: FormData,
  locale: AppLocale,
  t: I18nTranslator,
  supportedLocales?: readonly string[],
):
  | {
      data: LoginSubmission;
    }
  | LoginFormState {
  const rawValues = {
    email: readJsonField(formData, "email"),
    password: readJsonField(formData, "password"),
    redirectTo: readJsonField(formData, "redirectTo"),
  };
  const parsed = createLoginSchema(t).safeParse(rawValues);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
      values: {
        email: rawValues.email,
        redirectTo: normalizeRedirectTarget(
          rawValues.redirectTo,
          locale,
          supportedLocales,
        ),
      },
    };
  }

  return {
    data: {
      ...parsed.data,
      redirectTo: normalizeRedirectTarget(
        parsed.data.redirectTo,
        locale,
        supportedLocales,
      ),
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

function resolveLoginErrorMessage(
  status: number,
  t: I18nTranslator,
  code?: string,
  message?: string,
) {
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    code === "USER_NOT_FOUND" ||
    code === "INVALID_EMAIL_OR_PASSWORD" ||
    code === "INVALID_PASSWORD" ||
    message === "User not found"
  ) {
    return t("validation.login.invalidCredentials");
  }

  return t("validation.login.unavailable");
}

export async function signInWithEmail({
  context,
  locale,
  request,
  submission,
  supportedLocaleCodes,
  t,
}: SignInWithEmailOptions) {
  try {
    const existingUser = await findUserByEmail(context.db, submission.email);

    if (existingUser && !existingUser.isActive) {
      return data<LoginFormState>(
        {
          errors: {
            form: resolveLoginErrorMessage(403, t),
          },
          values: {
            email: submission.email,
            redirectTo: submission.redirectTo,
          },
        },
        {
          status: 403,
        },
      );
    }

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
              t,
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

    const localeState =
      locale && supportedLocaleCodes
        ? {
            locale,
            supportedLocaleCodes,
          }
        : await loadI18nRuntimeState(context, request);
    const redirectTarget = normalizeRedirectTarget(
      (await readSignInRedirect(response)) ?? submission.redirectTo,
      localeState.locale,
      localeState.supportedLocaleCodes,
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
            form: resolveLoginErrorMessage(status, t),
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
