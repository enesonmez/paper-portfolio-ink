import { expect, test, type Page } from "@playwright/test";

import {
  submitAuthorizedGet,
  signInAs,
  submitAuthorizedFetchForm,
  submitAuthorizedForm,
} from "./support/auth";
import {
  E2E_ADMIN_POST_ID,
  E2E_AUTHOR_POST_ID,
  E2E_AUTHOR_POST_TITLE,
  E2E_DASHBOARD_POST_TITLE,
  E2E_LOCALE_PREFIX,
  E2E_PROJECT_ID,
  E2E_SKILL_ID,
  E2E_USERS,
} from "./support/constants";

const FORBIDDEN_FLOW_MESSAGE = "Bu islemi gerceklestirme yetkiniz bulunmuyor.";
const EMPTY_LOG_DELETE_NOTICE = "0 hata logu silindi.";

const FUTURE_LOG_RANGE_FORM = {
  endAt: "2030-01-01T01:00",
  startAt: "2030-01-01T00:00",
} as const;

const AUTHOR_POST_BASE_FORM = {
  content: JSON.stringify({
    content: [
      {
        content: [
          {
            text: "Author-scoped dashboard permissions should allow reading and editing only records owned by the active editor.",
            type: "text",
          },
        ],
        type: "paragraph",
      },
    ],
    type: "doc",
  }),
  excerpt: "Author-owned seeded draft for hybrid authorization coverage.",
  slug: "author-owned-release-notes",
  status: "draft",
  title: "Author Owned Release Notes",
} as const;

test.use({ storageState: { cookies: [], origins: [] } });

function formatDashboardRegistryLabel(value: string) {
  return value.toUpperCase().replaceAll(" ", "_");
}

function buildUniqueSuffix() {
  return crypto.randomUUID().slice(0, 8);
}

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

async function expectInvalidAction(
  page: Page,
  path: string,
  form: Record<string, string>,
) {
  const response = await submitAuthorizedForm(page, path, form);

  expect(response.status()).toBe(400);
  await expect(response.text()).resolves.toContain(FORBIDDEN_FLOW_MESSAGE);
}

async function expectInvalidFetchAction(
  page: Page,
  path: string,
  form: Record<string, string>,
) {
  const response = await submitAuthorizedFetchForm(page, path, form);

  expect([200, 400]).toContain(response.status);
  expect(response.text).toContain(FORBIDDEN_FLOW_MESSAGE);
}

async function expectDeniedDashboardScreen(page: Page, path: string, role: string) {
  await page.goto(`${E2E_LOCALE_PREFIX}${path}`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Erisim reddedildi" }),
  ).toBeVisible();
  await expect(page.getByText(`Oturum rolu: ${role}`)).toBeVisible();
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
    await expect(page.getByRole("link", { name: /Loglar/i })).toHaveCount(0);

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
      "/dashboard/logging",
    ]) {
      await expectDeniedDashboardScreen(page, path, "author");
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

  test("allows updating an owned post via direct action requests", async ({ page }) => {
    const updatedTitle = "Author Owned Release Notes Updated";
    const updatedSlug = "author-owned-release-notes-updated";

    const updateResponse = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/posts`,
      {
        ...AUTHOR_POST_BASE_FORM,
        content: JSON.stringify({
          content: [
            {
              content: [
                {
                  text: "Author-owned update path remains available when the session owns the record.",
                  type: "text",
                },
              ],
              type: "paragraph",
            },
          ],
          type: "doc",
        }),
        excerpt: "Updated by the authorization matrix e2e test.",
        intent: "update",
        postId: E2E_AUTHOR_POST_ID,
        slug: updatedSlug,
        title: updatedTitle,
      },
    );

    expect(updateResponse.status()).toBe(302);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/posts`);
    await expect(
      page.getByText(formatDashboardRegistryLabel(updatedTitle)),
    ).toBeVisible();

    const restoreResponse = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/posts`,
      {
        ...AUTHOR_POST_BASE_FORM,
        intent: "update",
        postId: E2E_AUTHOR_POST_ID,
      },
    );

    expect(restoreResponse.status()).toBe(302);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/posts`);
    await expect(page.getByText(E2E_AUTHOR_POST_TITLE)).toBeVisible();
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

test.describe("admin positive mutation matrix", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, E2E_USERS.admin);
  });

  test("allows creating project records through direct action requests", async ({
    page,
  }) => {
    const suffix = buildUniqueSuffix();
    const title = `Playwright Authorization Project ${suffix}`;
    const summary = "Created by the authorization e2e matrix for admin grants.";

    const response = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/projects`,
      {
        coverImageUrl: "",
        description: "Admin create path remains writable when the claim is granted.",
        intent: "create",
        isFeatured: "false",
        liveUrl: "",
        repositoryUrl: "",
        slug: `playwright-authorization-project-${suffix}`,
        sortOrder: "90",
        status: "draft",
        summary,
        title,
      },
    );

    expect(response.status()).toBe(302);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/projects`);
    await expect(page.getByText(formatDashboardRegistryLabel(title))).toBeVisible();
    await expect(page.getByText(summary).first()).toBeVisible();
  });

  test("allows creating skill records through direct action requests", async ({
    page,
  }) => {
    const suffix = buildUniqueSuffix();
    const name = `Playwright Authorization Skill ${suffix}`;
    const summary = "Created by the authorization e2e matrix for admin grants.";

    const response = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/skills`,
      {
        iconKey: "cloud",
        intent: "create",
        name,
        sortOrder: "90",
        summary,
      },
    );

    expect(response.status()).toBe(302);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/skills`);
    await expect(page.getByText(formatDashboardRegistryLabel(name))).toBeVisible();
    await expect(page.getByText(summary).first()).toBeVisible();
  });

  test("allows creating user records through direct action requests", async ({
    page,
  }) => {
    const suffix = buildUniqueSuffix();
    const displayName = "Playwright Authorization User";
    const email = `playwright-authorization-user-${suffix}@paper-portfolio-ink.local`;

    const response = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/users`,
      {
        displayName,
        email,
        intent: "create",
        password: "PaperInk1234!",
        role: "author",
      },
    );

    expect(response.status()).toBe(302);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/users`);
    await expect(page.getByText(email, { exact: true })).toBeVisible();
    await expect(page.getByText(displayName).first()).toBeVisible();
  });

  test("rejects unsupported post mutation intents before authorization dispatch", async ({
    page,
  }) => {
    await expectInvalidAction(page, `${E2E_LOCALE_PREFIX}/dashboard/posts`, {
      intent: "publish-now",
    });
  });

  test("rejects unsupported resource mutation intents before authorization dispatch", async ({
    page,
  }) => {
    await expectInvalidFetchAction(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/resources/locales`,
      {
        intent: "publish-locale",
      },
    );
  });

  test("rejects unsupported logging mutation intents before authorization dispatch", async ({
    page,
  }) => {
    await expectInvalidAction(page, `${E2E_LOCALE_PREFIX}/dashboard/logging`, {
      ...FUTURE_LOG_RANGE_FORM,
      intent: "archive-errors",
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

  test("allows locale create, update and delete flows through direct action requests", async ({
    page,
  }) => {
    const suffix = buildUniqueSuffix();
    const createdCode = `zz-e2e-${suffix}`;
    const updatedCode = `zz-e2e-updated-${suffix}`;

    const createResponse = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/resources/locales`,
      {
        code: createdCode,
        intent: "create-locale",
        isActive: "true",
        isDefault: "false",
        label: `ZZ E2E ${suffix}`,
        sortOrder: "90",
      },
    );

    expect(createResponse.status()).toBe(302);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/resources/locales`);
    await expect(page.getByRole("table").getByText(`ZZ E2E ${suffix}`)).toBeVisible();

    const updateResponse = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/resources/locales`,
      {
        code: updatedCode,
        intent: "update-locale",
        isActive: "true",
        isDefault: "false",
        label: `ZZ E2E Updated ${suffix}`,
        originalCode: createdCode,
        sortOrder: "91",
      },
    );

    expect(updateResponse.status()).toBe(302);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/resources/locales`);
    await expect(
      page.getByRole("table").getByText(`ZZ E2E Updated ${suffix}`),
    ).toBeVisible();

    const deleteResponse = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/resources/locales`,
      {
        intent: "delete-locale",
        originalCode: updatedCode,
      },
    );

    expect(deleteResponse.status()).toBe(302);

    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard/resources/locales`);
    await expect(
      page.getByRole("table").getByText(`ZZ E2E Updated ${suffix}`),
    ).toHaveCount(0);
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

  test("allows translation create, update and delete flows through direct action requests", async ({
    page,
  }) => {
    const createdKey = "e2e.authorization.translation";
    const updatedKey = "e2e.authorization.translation.updated";

    const createResponse = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr`,
      {
        intent: "create-translation",
        key: createdKey,
        locale: "tr",
        value: "Authorization matrix translation",
      },
    );

    expect(createResponse.status()).toBe(302);

    await page.goto(
      `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr&translationSearch=${createdKey}`,
    );
    await expect(page.getByText(createdKey)).toBeVisible();
    await expect(page.getByText("Authorization matrix translation")).toBeVisible();

    const updateResponse = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr`,
      {
        intent: "update-translation",
        key: updatedKey,
        locale: "tr",
        originalKey: createdKey,
        originalLocale: "tr",
        value: "Authorization matrix translation updated",
      },
    );

    expect(updateResponse.status()).toBe(302);

    await page.goto(
      `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr&translationSearch=${updatedKey}`,
    );
    await expect(page.getByText(updatedKey)).toBeVisible();
    await expect(
      page.getByText("Authorization matrix translation updated"),
    ).toBeVisible();

    const deleteResponse = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr`,
      {
        intent: "delete-translation",
        originalKey: updatedKey,
        originalLocale: "tr",
      },
    );

    expect(deleteResponse.status()).toBe(302);

    await page.goto(
      `${E2E_LOCALE_PREFIX}/dashboard/resources/translations?translationLocale=tr&translationSearch=${updatedKey}`,
    );
    await expect(page.getByText(updatedKey)).toHaveCount(0);
  });
});

test.describe("logging action-only grants", () => {
  test("allows export actions without logging read access when only export is granted", async ({
    page,
  }) => {
    await signInAs(page, E2E_USERS.logExporter);
    await expectDeniedDashboardScreen(page, "/dashboard/logging", "author");

    const response = await submitAuthorizedGet(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/logging/export`,
      {
        ...FUTURE_LOG_RANGE_FORM,
        intent: "export-errors",
      },
    );

    expect(response.status()).toBe(200);
    await expect(response.text()).resolves.not.toContain(FORBIDDEN_FLOW_MESSAGE);
  });

  test("allows delete actions without logging read access when only delete is granted", async ({
    page,
  }) => {
    await signInAs(page, E2E_USERS.logCleaner);
    await expectDeniedDashboardScreen(page, "/dashboard/logging", "author");

    const response = await submitAuthorizedForm(
      page,
      `${E2E_LOCALE_PREFIX}/dashboard/logging.data`,
      {
        ...FUTURE_LOG_RANGE_FORM,
        intent: "delete-errors",
      },
    );

    expect(response.status()).toBe(200);
    await expect(response.text()).resolves.toContain(EMPTY_LOG_DELETE_NOTICE);
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

    await expectDeniedDashboardScreen(page, "/dashboard/users", "admin");
  });

  test("rejects user mutations after explicit user-level revoke overrides", async ({
    page,
  }) => {
    await expectForbiddenAction(page, `${E2E_LOCALE_PREFIX}/dashboard/users`, {
      intent: "create",
    });
  });
});
