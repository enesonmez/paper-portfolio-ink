import { expect, test } from "@playwright/test";
import { signInAs } from "./support/auth";
import { E2E_USERS, E2E_LOCALE_PREFIX } from "./support/constants";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("dashboard overview live data e2e", () => {
  test("renders all dynamic metrics and logs for an admin", async ({ page }) => {
    await signInAs(page, E2E_USERS.admin);
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard`);

    await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard$`));
    await expect(page.getByText("Sistem Durumu: Giris yapildi")).toBeVisible();

    const statsContainer = page.locator("section").first();
    const postCard = statsContainer
      .locator("section")
      .filter({ hasText: "Toplam yazi" })
      .locator("span")
      .first();
    const projectCard = statsContainer
      .locator("section")
      .filter({ hasText: "Toplam proje" })
      .locator("span")
      .first();
    const activeUsersCard = statsContainer
      .locator("section")
      .filter({ hasText: "Aktif kullanici" })
      .locator("span")
      .first();
    const skillsCard = statsContainer
      .locator("section")
      .filter({ hasText: "Toplam beceri" })
      .locator("span")
      .first();

    await expect(postCard).not.toHaveText("Yetkisiz");
    await expect(projectCard).not.toHaveText("Yetkisiz");
    await expect(activeUsersCard).not.toHaveText("Yetkisiz");
    await expect(skillsCard).not.toHaveText("Yetkisiz");

    await expect(page.getByRole("heading", { level: 2, name: "Loglar" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: "Icerigi yonet" }),
    ).toBeVisible();
  });

  test("locks unauthorized metrics and restricts feeds for an author", async ({
    page,
  }) => {
    await signInAs(page, E2E_USERS.author);
    await page.goto(`${E2E_LOCALE_PREFIX}/dashboard`);

    await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard$`));

    const statsContainer = page.locator("section").first();
    const postCard = statsContainer
      .locator("section")
      .filter({ hasText: "Toplam yazi" })
      .locator("span")
      .first();
    const projectCard = statsContainer
      .locator("section")
      .filter({ hasText: "Toplam proje" })
      .locator("span")
      .first();
    const activeUsersCard = statsContainer
      .locator("section")
      .filter({ hasText: "Aktif kullanici" })
      .locator("span")
      .first();
    const skillsCard = statsContainer
      .locator("section")
      .filter({ hasText: "Toplam beceri" })
      .locator("span")
      .first();

    await expect(postCard).not.toHaveText("Yetkisiz");
    await expect(projectCard).toHaveText("Yetkisiz");
    await expect(activeUsersCard).toHaveText("Yetkisiz");
    await expect(skillsCard).toHaveText("Yetkisiz");
  });
});
