import { expect, test } from "@playwright/test";

import {
  E2E_ADMIN_EMAIL,
  E2E_DASHBOARD_POST_TITLE,
  E2E_DASHBOARD_PROJECT_TITLE,
  E2E_DASHBOARD_SKILL_NAME,
  E2E_LOCALE_PREFIX,
  E2E_PROJECT_SUMMARY,
} from "./support/constants";

test("renders the dashboard shell and seeded content registries for an authenticated admin", async ({
  page,
}) => {
  await page.goto(`${E2E_LOCALE_PREFIX}/dashboard`);

  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard$`));
  await expect(page.getByText("Sistem Durumu: Giris yapildi")).toBeVisible();

  await page.getByRole("link", { name: /Projeler/i }).click();
  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/projects$`));
  await expect(page.getByText(E2E_DASHBOARD_PROJECT_TITLE)).toBeVisible();
  await expect(page.getByText(E2E_PROJECT_SUMMARY)).toBeVisible();

  await page.getByRole("link", { name: /Yazilar/i }).click();
  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/posts$`));
  await expect(page.getByText(E2E_DASHBOARD_POST_TITLE)).toBeVisible();

  await page.getByRole("link", { name: /Beceriler/i }).click();
  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/skills$`));
  await expect(page.getByText(E2E_DASHBOARD_SKILL_NAME)).toBeVisible();

  await page.getByRole("link", { name: /Kullanicilar/i }).click();
  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/users$`));
  await expect(page.getByText(E2E_ADMIN_EMAIL, { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /Ayarlar/i }).click();
  await expect(page).toHaveURL(
    new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/settings\\?tab=account$`),
  );
  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard ayarlari" }),
  ).toBeVisible();
  await expect(page.getByText("Paper Portfolio Ink")).toBeVisible();
});

test("filters seeded translation resources inside the admin settings area", async ({
  page,
}) => {
  await page.goto(
    `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr`,
  );

  await expect(page.getByText("Resource ayarlari")).toBeVisible();
  await page.getByLabel("Ara").fill("site.name");
  await page.getByRole("button", { name: /^Ara$/ }).click();

  await expect(page.getByText("site.name")).toBeVisible();
  await expect(page.getByText("Paper Ink")).toBeVisible();
});

test("renders logging tools for an authenticated admin on the errors tab", async ({
  page,
}) => {
  await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/logging?tab=errors`);

  await expect(page).toHaveURL(
    new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/logging\\?tab=errors$`),
  );
  await expect(
    page.getByRole("heading", { level: 1, name: "Audit ve hata loglari" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Audit kayitlari/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Hata kayitlari/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Excel olarak indir" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kayitlari sil" })).toBeVisible();
});

test("downloads an Excel file from the logging export action", async ({ page }) => {
  await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/logging?tab=errors`);

  await page.getByLabel("Baslangic tarihi").fill("2026-03-01T00:00");
  await page.getByLabel("Bitis tarihi").fill("2026-04-01T00:00");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Excel olarak indir" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^log-error-history-.*\.xlsx$/);
});
