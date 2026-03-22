import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { expect, test as setup } from "@playwright/test";

import { signIn } from "../support/auth";
import { E2E_LOCALE_PREFIX, E2E_STORAGE_STATE_PATH } from "../support/constants";

setup("create authenticated admin storage state", async ({ page }) => {
  mkdirSync(dirname(E2E_STORAGE_STATE_PATH), { recursive: true });

  await signIn(page);
  await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard$`));
  await page.context().storageState({ path: E2E_STORAGE_STATE_PATH });
});
