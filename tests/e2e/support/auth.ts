import { expect, type Page } from "@playwright/test";

import {
  E2E_ADMIN_EMAIL,
  E2E_ADMIN_PASSWORD,
  E2E_BASE_URL,
  E2E_LOCALE_PREFIX,
} from "./constants";

interface E2EUserCredentials {
  email: string;
  password: string;
}

function resolveLocalOffsetMinutes(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return String(date.getTimezoneOffset());
}

function withLoggingRangeOffsets(fields: Record<string, string>) {
  const nextFields = { ...fields };

  if (fields.startAt && !fields.startAtOffsetMinutes) {
    const startAtOffsetMinutes = resolveLocalOffsetMinutes(fields.startAt);

    if (startAtOffsetMinutes) {
      nextFields.startAtOffsetMinutes = startAtOffsetMinutes;
    }
  }

  if (fields.endAt && !fields.endAtOffsetMinutes) {
    const endAtOffsetMinutes = resolveLocalOffsetMinutes(fields.endAt);

    if (endAtOffsetMinutes) {
      nextFields.endAtOffsetMinutes = endAtOffsetMinutes;
    }
  }

  return nextFields;
}

export async function submitLoginForm(
  page: Page,
  credentials: E2EUserCredentials = {
    email: E2E_ADMIN_EMAIL,
    password: E2E_ADMIN_PASSWORD,
  },
) {
  await expect(page.getByLabel("E-posta")).toBeVisible();
  await page.getByLabel("E-posta").fill(credentials.email);
  await page.getByLabel("Parola").fill(credentials.password);
  await page.getByRole("button", { name: /Terminale_Gir/i }).click();
}

export async function signIn(
  page: Page,
  redirectTo = `${E2E_LOCALE_PREFIX}/dashboard`,
) {
  return signInAs(
    page,
    {
      email: E2E_ADMIN_EMAIL,
      password: E2E_ADMIN_PASSWORD,
    },
    redirectTo,
  );
}

export async function signInAs(
  page: Page,
  credentials: E2EUserCredentials,
  redirectTo = `${E2E_LOCALE_PREFIX}/dashboard`,
) {
  await page.goto(
    `${E2E_LOCALE_PREFIX}/login?redirectTo=${encodeURIComponent(redirectTo)}`,
  );
  await submitLoginForm(page, credentials);
  await page.waitForURL(`**${redirectTo}`);
}

export async function submitAuthorizedForm(
  page: Page,
  path: string,
  form: Record<string, string>,
) {
  return page.context().request.post(new URL(path, E2E_BASE_URL).toString(), {
    failOnStatusCode: false,
    form: withLoggingRangeOffsets(form),
    maxRedirects: 0,
  });
}

export async function submitAuthorizedGet(
  page: Page,
  path: string,
  query: Record<string, string>,
) {
  const url = new URL(path, E2E_BASE_URL);
  const queryWithOffsets = withLoggingRangeOffsets(query);

  for (const [key, value] of Object.entries(queryWithOffsets)) {
    url.searchParams.set(key, value);
  }

  return page.context().request.get(url.toString(), {
    failOnStatusCode: false,
    maxRedirects: 0,
  });
}

export async function submitAuthorizedFetchForm(
  page: Page,
  path: string,
  form: Record<string, string>,
) {
  const formWithOffsets = withLoggingRangeOffsets(form);

  return page.evaluate(
    async ({ path: targetPath, form: formFields }) => {
      const response = await fetch(targetPath, {
        body: new URLSearchParams(formFields),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });

      return {
        status: response.status,
        text: await response.text(),
      };
    },
    { form: formWithOffsets, path },
  );
}
