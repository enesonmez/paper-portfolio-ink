import { expect, test, type Page } from "@playwright/test";

import {
  signInAs,
  submitAuthorizedFetchForm,
  submitAuthorizedForm,
} from "./support/auth";
import {
  E2E_ADMIN_POST_ID,
  E2E_AUTHOR_POST_TITLE,
  E2E_DASHBOARD_POST_TITLE,
  E2E_LOCALE_PREFIX,
  E2E_PROJECT_ID,
  E2E_SKILL_ID,
  E2E_USERS,
} from "./support/constants";

const FORBIDDEN_FLOW_MESSAGE = "Bu islemi gerceklestirme yetkiniz bulunmuyor.";

test.use({ storageState: { cookies: [], origins: [] } });

async function expectForbiddenAction(
  page: Page,
  path: string,
  form: Record<string, string>,
) {
  const response = await submitAuthorizedForm(page, path, form);

  expect(response.status()).toBe(403);
  await expect(response.text()).resolves.toContain(FORBIDDEN_FLOW_MESSAGE);
}

async function expectForbiddenFetchAction(
  page: Page,
  path: string,
  form: Record<string, string>,
) {
  const response = await submitAuthorizedFetchForm(page, path, form);

  expect([200, 403]).toContain(response.status);
  expect(response.text).toContain(FORBIDDEN_FLOW_MESSAGE);
}

test.describe("author base role authorization", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, E2E_USERS.author);
  });

  test("limits navigation to dashboard and posts, and only exposes owned posts", async ({
    page,
  }) => {
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard`);

    await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Yazilar/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Projeler/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Beceriler/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Kullanicilar/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Kaynaklar/i })).toHaveCount(0);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/posts`);
    await expect(page.getByText(E2E_AUTHOR_POST_TITLE)).toBeVisible();
    await expect(page.getByText(E2E_DASHBOARD_POST_TITLE)).toHaveCount(0);
  });

  test("renders denied screens for admin-only registries", async ({ page }) => {
    for (const path of [
      "/dashboard/projects",
      "/dashboard/skills",
      "/dashboard/users",
      "/dashboard/resources",
    ]) {
      await page.goto(`${E2E_LOCALE_PREFIX}${path}`);
      await expect(
        page.getByRole("heading", { level: 1, name: "Erisim reddedildi" }),
      ).toBeVisible();
      await expect(page.getByText("Oturum rolu: author")).toBeVisible();
    }
  });

  test("blocks mutating another author's post via direct action requests", async ({
    page,
  }) => {
    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/posts`, {
      intent: "delete",
      postId: E2E_ADMIN_POST_ID,
    });
  });
});

test.describe("hybrid read-only registry grants", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, E2E_USERS.registryAuditor);
  });

  test("grants read access to projects, skills and users through DB overrides", async ({
    page,
  }) => {
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard`);

    await expect(page.getByRole("link", { name: /Projeler/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Beceriler/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Kullanicilar/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Kaynaklar/i })).toHaveCount(0);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/projects`);
    await expect(page.getByText("Proje kayitlari")).toBeVisible();

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/skills`);
    await expect(page.getByText("Beceri kayitlari")).toBeVisible();

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/users`);
    await expect(page.getByText("Kullanici kayitlari")).toBeVisible();
  });

  test("rejects project, skill and user mutations without matching CRUD claims", async ({
    page,
  }) => {
    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/projects`, {
      intent: "create",
    });
    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/projects`, {
      intent: "update",
      projectId: E2E_PROJECT_ID,
    });
    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/projects`, {
      intent: "delete",
      projectId: E2E_PROJECT_ID,
    });

    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/skills`, {
      intent: "create",
    });
    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/skills`, {
      intent: "delete",
      skillId: E2E_SKILL_ID,
    });

    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/users`, {
      intent: "create",
    });
    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/users`, {
      intent: "update",
      userId: E2E_USERS.author.id,
    });
    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/users`, {
      intent: "delete",
      userId: E2E_USERS.author.id,
    });
  });
});

test.describe("locale-only resource operator", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, E2E_USERS.localeOperator);
  });

  test("redirects unreadable translation routes into locales and hides translation controls", async ({
    page,
  }) => {
    await page.goto(
      `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr`,
    );

    await expect(page).toHaveURL(
      new RegExp(`${E2E_LOCALE_PREFIX}/dashboard/resources/locales$`),
    );
    await expect(page.getByRole("link", { name: "Locales" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Translations" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Locale ekle" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Translation ekle" })).toHaveCount(0);
  });

  test("rejects translation mutations when only locale claims are granted", async ({
    page,
  }) => {
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/resources/locales`);

    await expectForbiddenFetchAction(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr`,
      {
        intent: "create-translation",
      },
    );
  });
});

test.describe("translation-only resource operator", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, E2E_USERS.translationOperator);
  });

  test("redirects unreadable locale routes into translations and hides locale controls", async ({
    page,
  }) => {
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/resources/locales`);

    await expect(page).toHaveURL(
      new RegExp(
        `${E2E_LOCALE_PREFIX}/dashboard/resources/translations\\?translationLocale=tr$`,
      ),
    );
    await expect(page.getByRole("link", { name: "Translations" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Translation ekle" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Locale ekle" })).toHaveCount(0);
  });

  test("rejects locale mutations when only translation claims are granted", async ({
    page,
  }) => {
    await page.goto(
      `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr`,
    );

    await expectForbiddenFetchAction(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/resources/locales`,
      {
        intent: "create-locale",
      },
    );
  });
});

test.describe("user-level revokes on admin role", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, E2E_USERS.revokedAdmin);
  });

  test("applies revoke overrides over admin defaults for the users registry", async ({
    page,
  }) => {
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard`);

    await expect(page.getByRole("link", { name: /Projeler/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Kullanicilar/i })).toHaveCount(0);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/users`);
    await expect(
      page.getByRole("heading", { level: 1, name: "Erisim reddedildi" }),
    ).toBeVisible();
    await expect(page.getByText("Oturum rolu: admin")).toBeVisible();
  });

  test("rejects user mutations after explicit user-level revoke overrides", async ({
    page,
  }) => {
    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/users`, {
      intent: "create",
    });
  });
});
