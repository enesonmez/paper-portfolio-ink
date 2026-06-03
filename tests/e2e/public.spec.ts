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

test("sends blog tracking beacons on client-side exit and stores a view lock cookie", async ({
  context,
  page,
}) => {
  await page.goto(`${E2E_LOCALE_PREFIX}/blog/${E2E_POST_SLUG}`);
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1200);

  const trackRequestPromise = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      request.url().endsWith(`${E2E_LOCALE_PREFIX}/blog/track`),
  );

  await page
    .getByRole("navigation", { name: "Public navigasyon" })
    .getByRole("link", { exact: true, name: "Ana sayfa" })
    .click();

  const trackRequest = await trackRequestPromise;
  const payload = new URLSearchParams(trackRequest.postData() ?? "");

  expect(payload.get("slug")).toBe(E2E_POST_SLUG);
  expect(Number(payload.get("scrollRate"))).toBeGreaterThan(0);
  expect(Number(payload.get("secondsSpent"))).toBeGreaterThanOrEqual(1);
  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}$`));

  await expect
    .poll(async () => {
      const cookies = await context.cookies();

      return (
        cookies.find((cookie) => cookie.name === "__Host-paper-view-lock")?.value ??
        null
      );
    })
    .not.toBeNull();
});
