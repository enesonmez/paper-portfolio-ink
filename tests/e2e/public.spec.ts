import { expect, test } from "@playwright/test";

import {
  E2E_LOCALE_PREFIX,
  E2E_POST_DETAIL_SNIPPET,
  E2E_POST_SLUG,
  E2E_POST_TITLE,
  E2E_PROJECT_TITLE,
  E2E_SKILL_NAME,
} from "./support/constants";

test("redirects root to the localized public home and exposes seeded content", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}$`));
  await expect(page.getByText(E2E_PROJECT_TITLE)).toBeVisible();
  await expect(page.getByText(E2E_SKILL_NAME)).toBeVisible();

  await page
    .getByRole("navigation", { name: "Public navigasyon" })
    .getByRole("link", { exact: true, name: "Projeler" })
    .click();
  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/projects$`));
  await expect(
    page.getByRole("heading", { level: 2, name: E2E_PROJECT_TITLE }),
  ).toBeVisible();

  await page
    .getByRole("navigation", { name: "Public navigasyon" })
    .getByRole("link", { exact: true, name: "Blog" })
    .click();
  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/blog$`));
  await expect(page.getByRole("link", { name: E2E_POST_TITLE }).first()).toBeVisible();
});

test("forwards legacy blog URLs to the active locale and renders the seeded article", async ({
  page,
}) => {
  await page.goto("/blog");

  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/blog$`));
  await page.getByRole("link", { name: E2E_POST_TITLE }).first().click();

  await expect(page).toHaveURL(
    new RegExp(`${E2E_LOCALE_PREFIX}/blog/${E2E_POST_SLUG}$`),
  );
  await expect(
    page.getByRole("heading", { level: 1, name: E2E_POST_TITLE }),
  ).toBeVisible();
  await expect(page.getByText(E2E_POST_DETAIL_SNIPPET)).toBeVisible();
});

test("forwards legacy project URLs to the active locale and renders seeded project cards", async ({
  page,
}) => {
  await page.goto("/projects");

  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/projects$`));
  await expect(
    page.getByRole("heading", { level: 2, name: E2E_PROJECT_TITLE }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Canli build" }).first()).toBeVisible();
});
