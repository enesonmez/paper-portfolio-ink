import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { expect, test as setup } from "@playwright/test";

import { signInAs } from "../support/auth";
import { E2E_LOCALE_PREFIX, E2E_USERS } from "../support/constants";

const STORAGE_STATE_USERS = [
  {
    name: "admin",
    user: E2E_USERS.admin,
  },
  {
    name: "author",
    user: E2E_USERS.author,
  },
  {
    name: "registry auditor",
    user: E2E_USERS.registryAuditor,
  },
  {
    name: "locale operator",
    user: E2E_USERS.localeOperator,
  },
  {
    name: "translation operator",
    user: E2E_USERS.translationOperator,
  },
  {
    name: "revoked admin",
    user: E2E_USERS.revokedAdmin,
  },
] as const;

for (const entry of STORAGE_STATE_USERS) {
  setup(`create authenticated ${entry.name} storage state`, async ({ page }) => {
    mkdirSync(dirname(entry.user.storageStatePath), { recursive: true });

    await signInAs(page, entry.user);
    await expect(page).toHaveURL(new RegExp(`${E2E_LOCALE_PREFIX}/dashboard$`));
    await page.context().storageState({ path: entry.user.storageStatePath });
  });
}
