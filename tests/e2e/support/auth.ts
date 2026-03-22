import { expect, type Page } from "@playwright/test";

import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_LOCALE_PREFIX } from "./constants";

export async function submitLoginForm(page: Page) {
  await expect(page.getByLabel("E-posta")).toBeVisible();
  await page.getByLabel("E-posta").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("Parola").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: /Terminale_Gir/i }).click();
}

export async function signIn(
  page: Page,
  redirectTo = `${E2E_LOCALE_PREFIX}/dashboard`,
) {
  await page.goto(
    `${E2E_LOCALE_PREFIX}/login?redirectTo=${encodeURIComponent(redirectTo)}`,
  );
  await submitLoginForm(page);
  await page.waitForURL(`**${redirectTo}`);
}
