import { expect, test } from "@playwright/test";

import { submitLoginForm } from "./support/auth";
import { E2E_LOCALE_PREFIX } from "./support/constants";

test("shows a localized validation error for invalid credentials", async ({ page }) => {
  await page.goto(`${E2E_LOCALE_PREFIX}/login`);

  await page.getByLabel("E-posta").fill("wrong@paper-portfolio-ink.local");
  await page.getByLabel("Parola").fill("WrongPass1234!");
  await page.getByRole("button", { name: /Terminale_Gir/i }).click();

  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/login$`));
  await expect(page.getByText("E-posta veya parola hatali.")).toBeVisible();
});

test("redirects protected routes through login and returns to the requested dashboard page", async ({
  page,
}) => {
  await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/projects`);

  await expect(page).toHaveURL(
    new RegExp(`${E2E_LOCALE_PREFIX}/login\\?redirectTo=%2Ftr%2Fdashboard%2Fprojects$`),
  );

  await submitLoginForm(page);

  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/projects$`));
  await expect(page.getByText("Proje kayitlari")).toBeVisible();
});

test("logs out and restores the dashboard guard", async ({ page }) => {
  await page.goto(`${E2E_LOCALE_PREFIX}/dashboard`);
  await submitLoginForm(page);

  await page.getByRole("button", { name: /oturumunu kapat/i }).click();

  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/login$`));

  await page.goto(`${E2E_LOCALE_PREFIX}/dashboard`);
  await expect(page).toHaveURL(
    new RegExp(`${E2E_LOCALE_PREFIX}/login\\?redirectTo=%2Ftr%2Fdashboard$`),
  );
});
