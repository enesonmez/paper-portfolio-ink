import path from "node:path";

export const E2E_LOCALE = "tr";
export const E2E_LOCALE_PREFIX = `/${E2E_LOCALE}`;

export const E2E_ADMIN_EMAIL =
  process.env.SEED_USER_EMAIL ?? "admin@paper-portfolio-ink.local";
export const E2E_ADMIN_PASSWORD = process.env.SEED_USER_PASSWORD ?? "PaperInk1234!";

export const E2E_PROJECT_TITLE = "Edge Portfolio Kernel";
export const E2E_PROJECT_SUMMARY =
  "React Router v7 and Cloudflare D1 working together on an edge-first portfolio.";
export const E2E_DASHBOARD_PROJECT_TITLE = "EDGE_PORTFOLIO_KERNEL";
export const E2E_POST_SLUG = "edge-runtime-field-notes";
export const E2E_POST_TITLE = "Edge Runtime Field Notes";
export const E2E_DASHBOARD_POST_TITLE = "EDGE_RUNTIME_FIELD_NOTES";
export const E2E_POST_DETAIL_SNIPPET =
  "This seeded article exists so the Playwright suite can verify the public feed";
export const E2E_SKILL_NAME = "Cloudflare Workers";
export const E2E_DASHBOARD_SKILL_NAME = "CLOUDFLARE_WORKERS";

export const E2E_STORAGE_STATE_PATH = path.resolve(
  process.cwd(),
  "tests/e2e/.auth/admin.json",
);
