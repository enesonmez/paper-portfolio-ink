import { expect, test } from "@playwright/test";

import { signInAs } from "./support/auth";
import {
  E2E_LOCALE_PREFIX,
  E2E_USERS,
  E2E_DASHBOARD_POST_TITLE,
  E2E_AUTHOR_POST_TITLE,
} from "./support/constants";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("analytics admin features", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, E2E_USERS.admin);
  });

  test("renders the analytics overview and permits searching and modal interactions", async ({
    page,
  }) => {
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/analytics`);

    await expect(page).toHaveURL(
      new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/analytics$`),
    );
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Analitik ve Raporlama",
        exact: true,
      }),
    ).toBeVisible();

    await expect(page.getByText(/Toplam Goruntulenme/i)).toBeVisible();
    await expect(page.getByText(/Ort. Okuma Orani/i)).toBeVisible();
    await expect(page.getByText(/Ort. Zaman Gecirme/i)).toBeVisible();

    await page.getByLabel(/Yazi ara/i).fill("EDGE_RUNTIME_FIELD_NOTES");
    await page.getByRole("button", { name: /^Ara$/i }).click();

    await expect(page.getByText(E2E_DASHBOARD_POST_TITLE)).toBeVisible();

    await page
      .getByRole("link", { name: /Ziyaret/i })
      .first()
      .click();

    await expect(page.locator("div[role='dialog']")).toBeVisible();
    await expect(page.getByRole("link", { name: "Kapat", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Kapat", exact: true }).click();
    await expect(page.locator("div[role='dialog']")).toHaveCount(0);
  });
});

test.describe("analytics author features", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, E2E_USERS.author);
  });

  test("limits post details to owned records only", async ({ page }) => {
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/analytics`);

    await expect(page).toHaveURL(
      new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/analytics$`),
    );
    await expect(page.getByText(E2E_AUTHOR_POST_TITLE)).toBeVisible();
    await expect(page.getByText(E2E_DASHBOARD_POST_TITLE)).toHaveCount(0);
  });
});

test.describe("analytics unauthorized safeguards", () => {
  test("prevents anonymous access", async ({ page }) => {
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/analytics`);
    await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/login`));
  });
});
