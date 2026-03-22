import { hashPassword } from "better-auth/crypto";
import { getPlatformProxy } from "wrangler";

const DEFAULT_USER = {
  displayName: "Enes Test Admin",
  email: "admin@paper-portfolio-ink.local",
  password: "PaperInk1234!",
  role: "admin",
};

const FIXTURES = {
  postId: "e2e-post-edge-runtime-field-notes",
  projectId: "e2e-project-edge-portfolio-kernel",
  skillId: "e2e-skill-cloudflare-workers",
};

const FIXTURE_SKILL = {
  iconKey: "cloud",
  name: "Cloudflare Workers",
  slug: "cloudflare-workers",
  sortOrder: 1,
  summary: "Edge runtime handlers, caching seams and D1-backed delivery flows.",
};

const FIXTURE_PROJECT = {
  coverImageUrl: "",
  description:
    "Production-ready portfolio shell, localized public routes and guarded dashboard flows.",
  isFeatured: true,
  liveUrl: "https://paper-portfolio-ink.example/live",
  repositoryUrl: "https://github.com/enesonmez/paper-portfolio-ink",
  slug: "edge-portfolio-kernel",
  sortOrder: 1,
  status: "published",
  summary:
    "React Router v7 and Cloudflare D1 working together on an edge-first portfolio.",
  title: "Edge Portfolio Kernel",
};

const FIXTURE_POST = {
  content: JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Cloudflare Pages Functions and React Router loaders stay predictable when data contracts, auth guards and caching seams are kept narrow and typed.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This seeded article exists so the Playwright suite can verify the public feed, post detail rendering and authenticated dashboard inventory against deterministic D1 data.",
          },
        ],
      },
    ],
  }),
  coverImageUrl: "",
  excerpt:
    "Cloudflare Pages Functions and React Router loaders stay predictable when edge data contracts stay narrow.",
  slug: "edge-runtime-field-notes",
  status: "published",
  title: "Edge Runtime Field Notes",
};

const FIXTURE_TIMESTAMPS = {
  createdAt: Date.parse("2026-03-21T08:30:00.000Z"),
  publishedAt: Date.parse("2026-03-22T09:00:00.000Z"),
  updatedAt: Date.parse("2026-03-22T09:15:00.000Z"),
};

function readSeedUser() {
  return {
    displayName: process.env.SEED_USER_NAME ?? DEFAULT_USER.displayName,
    email: process.env.SEED_USER_EMAIL ?? DEFAULT_USER.email,
    password: process.env.SEED_USER_PASSWORD ?? DEFAULT_USER.password,
    role: DEFAULT_USER.role,
  };
}

async function findExistingUserId(db, email) {
  const row = await db
    .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .bind(email)
    .first();

  return row && typeof row.id === "string" ? row.id : crypto.randomUUID();
}

async function findExistingAccountId(db, userId) {
  const row = await db
    .prepare(
      "SELECT id FROM accounts WHERE provider_id = 'credential' AND account_id = ? LIMIT 1",
    )
    .bind(userId)
    .first();

  return row && typeof row.id === "string" ? row.id : crypto.randomUUID();
}

async function seedE2eFixtures() {
  const seededUser = readSeedUser();
  const platform = await getPlatformProxy({
    persist: true,
    remoteBindings: false,
  });

  try {
    const db = platform.env.DB;
    const userId = await findExistingUserId(db, seededUser.email);
    const accountId = await findExistingAccountId(db, userId);
    const passwordHash = await hashPassword(seededUser.password);

    await db.batch([
      db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
      db
        .prepare(
          "DELETE FROM accounts WHERE user_id = ? OR (provider_id = 'credential' AND account_id = ?)",
        )
        .bind(userId, userId),
      db.prepare("DELETE FROM posts WHERE slug = ?").bind(FIXTURE_POST.slug),
      db.prepare("DELETE FROM projects WHERE slug = ?").bind(FIXTURE_PROJECT.slug),
      db.prepare("DELETE FROM skills WHERE slug = ?").bind(FIXTURE_SKILL.slug),
      db
        .prepare(
          [
            "INSERT INTO users (id, email, email_verified, display_name, is_active, role, created_at, updated_at)",
            "VALUES (?, ?, 0, ?, 1, ?, ?, ?)",
            "ON CONFLICT(email) DO UPDATE SET",
            "display_name = excluded.display_name,",
            "is_active = excluded.is_active,",
            "role = excluded.role,",
            "updated_at = excluded.updated_at",
          ].join(" "),
        )
        .bind(
          userId,
          seededUser.email,
          seededUser.displayName,
          seededUser.role,
          FIXTURE_TIMESTAMPS.createdAt,
          FIXTURE_TIMESTAMPS.updatedAt,
        ),
      db
        .prepare(
          [
            "INSERT INTO accounts (id, user_id, account_id, provider_id, password, created_at, updated_at)",
            "VALUES (?, ?, ?, 'credential', ?, ?, ?)",
            "ON CONFLICT(provider_id, account_id) DO UPDATE SET",
            "user_id = excluded.user_id,",
            "password = excluded.password,",
            "updated_at = excluded.updated_at",
          ].join(" "),
        )
        .bind(
          accountId,
          userId,
          userId,
          passwordHash,
          FIXTURE_TIMESTAMPS.createdAt,
          FIXTURE_TIMESTAMPS.updatedAt,
        ),
      db
        .prepare(
          [
            "INSERT INTO skills (id, icon_key, name, sort_order, slug, summary, created_at, updated_at)",
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          ].join(" "),
        )
        .bind(
          FIXTURES.skillId,
          FIXTURE_SKILL.iconKey,
          FIXTURE_SKILL.name,
          FIXTURE_SKILL.sortOrder,
          FIXTURE_SKILL.slug,
          FIXTURE_SKILL.summary,
          FIXTURE_TIMESTAMPS.createdAt,
          FIXTURE_TIMESTAMPS.updatedAt,
        ),
      db
        .prepare(
          [
            "INSERT INTO projects (id, title, slug, summary, description, repository_url, live_url, cover_image_url, status, is_featured, sort_order, created_at, updated_at)",
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          ].join(" "),
        )
        .bind(
          FIXTURES.projectId,
          FIXTURE_PROJECT.title,
          FIXTURE_PROJECT.slug,
          FIXTURE_PROJECT.summary,
          FIXTURE_PROJECT.description,
          FIXTURE_PROJECT.repositoryUrl,
          FIXTURE_PROJECT.liveUrl,
          FIXTURE_PROJECT.coverImageUrl,
          FIXTURE_PROJECT.status,
          Number(FIXTURE_PROJECT.isFeatured),
          FIXTURE_PROJECT.sortOrder,
          FIXTURE_TIMESTAMPS.createdAt,
          FIXTURE_TIMESTAMPS.updatedAt,
        ),
      db
        .prepare(
          [
            "INSERT INTO posts (id, author_id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at)",
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          ].join(" "),
        )
        .bind(
          FIXTURES.postId,
          userId,
          FIXTURE_POST.title,
          FIXTURE_POST.slug,
          FIXTURE_POST.excerpt,
          FIXTURE_POST.content,
          FIXTURE_POST.coverImageUrl,
          FIXTURE_POST.status,
          FIXTURE_TIMESTAMPS.publishedAt,
          FIXTURE_TIMESTAMPS.createdAt,
          FIXTURE_TIMESTAMPS.updatedAt,
        ),
    ]);

    console.log(
      JSON.stringify(
        {
          seeded: true,
          email: seededUser.email,
          fixtures: {
            postSlug: FIXTURE_POST.slug,
            projectSlug: FIXTURE_PROJECT.slug,
            skillSlug: FIXTURE_SKILL.slug,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    await platform.dispose();
  }
}

await seedE2eFixtures();
