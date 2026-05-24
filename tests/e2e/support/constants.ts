import path from "node:path";

export const E2E_LOCALE = "tr";
export const E2E_LOCALE_PREFIX = `/${E2E_LOCALE}`;
export const E2E_BASE_URL = "http://127.0.0.1:4173";
const DEFAULT_E2E_PASSWORD = "fixture-local-only-password";

function buildStorageStatePath(filename: string) {
  return path.resolve(process.cwd(), "tests/e2e/.auth", filename);
}

function resolveFixturePassword(storageKey: string) {
  return process.env.E2E_USER_PASSWORD ?? `${DEFAULT_E2E_PASSWORD}-${storageKey}`;
}

export const E2E_USERS = {
  admin: {
    email: process.env.SEED_USER_EMAIL ?? "admin@paper-portfolio-ink.local",
    id: "e2e-user-admin",
    password: process.env.SEED_USER_PASSWORD ?? resolveFixturePassword("admin"),
    role: "admin",
    storageStatePath: buildStorageStatePath("admin.json"),
  },
  author: {
    email: "author@paper-portfolio-ink.local",
    id: "e2e-user-author",
    password: resolveFixturePassword("author"),
    role: "author",
    storageStatePath: buildStorageStatePath("author.json"),
  },
  localeOperator: {
    email: "locale-operator@paper-portfolio-ink.local",
    id: "e2e-user-locale-operator",
    password: resolveFixturePassword("locale-operator"),
    role: "author",
    storageStatePath: buildStorageStatePath("locale-operator.json"),
  },
  logCleaner: {
    email: "log-cleaner@paper-portfolio-ink.local",
    id: "e2e-user-log-cleaner",
    password: resolveFixturePassword("log-cleaner"),
    role: "author",
    storageStatePath: buildStorageStatePath("log-cleaner.json"),
  },
  logExporter: {
    email: "log-exporter@paper-portfolio-ink.local",
    id: "e2e-user-log-exporter",
    password: resolveFixturePassword("log-exporter"),
    role: "author",
    storageStatePath: buildStorageStatePath("log-exporter.json"),
  },
  registryAuditor: {
    email: "registry-auditor@paper-portfolio-ink.local",
    id: "e2e-user-registry-auditor",
    password: resolveFixturePassword("registry-auditor"),
    role: "author",
    storageStatePath: buildStorageStatePath("registry-auditor.json"),
  },
  revokedAdmin: {
    email: "revoked-admin@paper-portfolio-ink.local",
    id: "e2e-user-revoked-admin",
    password: resolveFixturePassword("revoked-admin"),
    role: "admin",
    storageStatePath: buildStorageStatePath("revoked-admin.json"),
  },
  translationOperator: {
    email: "translation-operator@paper-portfolio-ink.local",
    id: "e2e-user-translation-operator",
    password: resolveFixturePassword("translation-operator"),
    role: "author",
    storageStatePath: buildStorageStatePath("translation-operator.json"),
  },
} as const;

export const E2E_ADMIN_EMAIL = E2E_USERS.admin.email;
export const E2E_ADMIN_PASSWORD = E2E_USERS.admin.password;

export const E2E_PROJECT_TITLE = "Edge Portfolio Kernel";
export const E2E_PROJECT_SUMMARY =
  "React Router v7 and Cloudflare D1 working together on an edge-first portfolio.";
export const E2E_DASHBOARD_PROJECT_TITLE = "EDGE_PORTFOLIO_KERNEL";
export const E2E_POST_SLUG = "edge-runtime-field-notes";
export const E2E_POST_TITLE = "Edge Runtime Field Notes";
export const E2E_DASHBOARD_POST_TITLE = "EDGE_RUNTIME_FIELD_NOTES";
export const E2E_AUTHOR_POST_ID = "e2e-post-author-owned-notes";
export const E2E_AUTHOR_POST_TITLE = "AUTHOR_OWNED_RELEASE_NOTES";
export const E2E_POST_DETAIL_SNIPPET =
  "This seeded article exists so the Playwright suite can verify the public feed";
export const E2E_SKILL_NAME = "Cloudflare Workers";
export const E2E_DASHBOARD_SKILL_NAME = "CLOUDFLARE_WORKERS";
export const E2E_ADMIN_POST_ID = "e2e-post-edge-runtime-field-notes";
export const E2E_PROJECT_ID = "e2e-project-edge-portfolio-kernel";
export const E2E_SKILL_ID = "e2e-skill-cloudflare-workers";
export const E2E_REVOKED_ADMIN_EMAIL = E2E_USERS.revokedAdmin.email;
