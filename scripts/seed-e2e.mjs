import { hashPassword } from "better-auth/crypto";
import { getPlatformProxy } from "wrangler";

const FIXTURES = {
  adminPostId: "e2e-post-edge-runtime-field-notes",
  adminProjectId: "e2e-project-edge-portfolio-kernel",
  adminSkillId: "e2e-skill-cloudflare-workers",
  authorPostId: "e2e-post-author-owned-notes",
};

const FIXTURE_USERS = [
  {
    displayName: "Paper Test Admin",
    email: process.env.SEED_USER_EMAIL ?? "admin@paper-portfolio-ink.local",
    id: "e2e-user-admin",
    password: process.env.SEED_USER_PASSWORD ?? "PaperInk1234!",
    role: "admin",
    storageKey: "admin",
  },
  {
    claimOverrides: [],
    displayName: "Ayla Test Author",
    email: "author@paper-portfolio-ink.local",
    id: "e2e-user-author",
    password: "PaperInk1234!",
    role: "author",
    storageKey: "author",
  },
  {
    claimOverrides: [
      { claimKey: "projects.read", effect: "grant" },
      { claimKey: "skills.read", effect: "grant" },
      { claimKey: "users.read", effect: "grant" },
    ],
    displayName: "Rana Registry Auditor",
    email: "registry-auditor@paper-portfolio-ink.local",
    id: "e2e-user-registry-auditor",
    password: "PaperInk1234!",
    role: "author",
    storageKey: "registryAuditor",
  },
  {
    claimOverrides: [
      { claimKey: "resources.locales.read", effect: "grant" },
      { claimKey: "resources.locales.create", effect: "grant" },
      { claimKey: "resources.locales.update", effect: "grant" },
      { claimKey: "resources.locales.delete", effect: "grant" },
    ],
    displayName: "Lale Locale Operator",
    email: "locale-operator@paper-portfolio-ink.local",
    id: "e2e-user-locale-operator",
    password: "PaperInk1234!",
    role: "author",
    storageKey: "localeOperator",
  },
  {
    claimOverrides: [{ claimKey: "logs.export", effect: "grant" }],
    displayName: "Ege Log Exporter",
    email: "log-exporter@paper-portfolio-ink.local",
    id: "e2e-user-log-exporter",
    password: "PaperInk1234!",
    role: "author",
    storageKey: "logExporter",
  },
  {
    claimOverrides: [{ claimKey: "logs.delete", effect: "grant" }],
    displayName: "Deniz Log Cleaner",
    email: "log-cleaner@paper-portfolio-ink.local",
    id: "e2e-user-log-cleaner",
    password: "PaperInk1234!",
    role: "author",
    storageKey: "logCleaner",
  },
  {
    claimOverrides: [
      { claimKey: "resources.translations.read", effect: "grant" },
      { claimKey: "resources.translations.create", effect: "grant" },
      { claimKey: "resources.translations.update", effect: "grant" },
      { claimKey: "resources.translations.delete", effect: "grant" },
    ],
    displayName: "Tuna Translation Operator",
    email: "translation-operator@paper-portfolio-ink.local",
    id: "e2e-user-translation-operator",
    password: "PaperInk1234!",
    role: "author",
    storageKey: "translationOperator",
  },
  {
    claimOverrides: [
      { claimKey: "users.read", effect: "revoke" },
      { claimKey: "users.create", effect: "revoke" },
      { claimKey: "users.update", effect: "revoke" },
      { claimKey: "users.delete", effect: "revoke" },
    ],
    displayName: "Vera Revoked Admin",
    email: "revoked-admin@paper-portfolio-ink.local",
    id: "e2e-user-revoked-admin",
    password: "PaperInk1234!",
    role: "admin",
    storageKey: "revokedAdmin",
  },
];

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

const FIXTURE_POSTS = [
  {
    authorStorageKey: "admin",
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
    id: FIXTURES.adminPostId,
    slug: "edge-runtime-field-notes",
    status: "published",
    title: "Edge Runtime Field Notes",
  },
  {
    authorStorageKey: "author",
    content: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Author-scoped dashboard permissions should allow reading and editing only records owned by the active editor.",
            },
          ],
        },
      ],
    }),
    coverImageUrl: "",
    excerpt: "Author-owned seeded draft for hybrid authorization coverage.",
    id: FIXTURES.authorPostId,
    slug: "author-owned-release-notes",
    status: "draft",
    title: "Author Owned Release Notes",
  },
];

const FIXTURE_TIMESTAMPS = {
  createdAt: Date.parse("2026-03-21T08:30:00.000Z"),
  publishedAt: Date.parse("2026-03-22T09:00:00.000Z"),
  updatedAt: Date.parse("2026-03-22T09:15:00.000Z"),
};

async function findExistingAccountId(db, userId) {
  const row = await db
    .prepare(
      "SELECT id FROM accounts WHERE provider_id = 'credential' AND account_id = ? LIMIT 1",
    )
    .bind(userId)
    .first();

  return row && typeof row.id === "string" ? row.id : crypto.randomUUID();
}

async function findExistingUserId(db, email, fallbackId) {
  const row = await db
    .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .bind(email)
    .first();

  return row && typeof row.id === "string" ? row.id : fallbackId;
}

function buildUserBatchStatements(db, user, passwordHash, accountId) {
  return [
    db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id),
    db
      .prepare(
        "DELETE FROM accounts WHERE user_id = ? OR (provider_id = 'credential' AND account_id = ?)",
      )
      .bind(user.id, user.id),
    db
      .prepare("DELETE FROM authorization_user_claim_overrides WHERE user_id = ?")
      .bind(user.id),
    db
      .prepare(
        [
          "INSERT INTO users (id, email, email_verified, display_name, is_active, authz_version, role, created_at, updated_at)",
          "VALUES (?, ?, 0, ?, 1, 1, ?, ?, ?)",
          "ON CONFLICT(id) DO UPDATE SET",
          "email = excluded.email,",
          "display_name = excluded.display_name,",
          "is_active = excluded.is_active,",
          "authz_version = excluded.authz_version,",
          "role = excluded.role,",
          "updated_at = excluded.updated_at",
        ].join(" "),
      )
      .bind(
        user.id,
        user.email,
        user.displayName,
        user.role,
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
        user.id,
        user.id,
        passwordHash,
        FIXTURE_TIMESTAMPS.createdAt,
        FIXTURE_TIMESTAMPS.updatedAt,
      ),
  ];
}

function buildUserOverrideStatements(db, user) {
  return (user.claimOverrides ?? []).map((override) =>
    db
      .prepare(
        [
          "INSERT INTO authorization_user_claim_overrides (user_id, claim_key, effect, created_at, updated_at)",
          "VALUES (?, ?, ?, ?, ?)",
          "ON CONFLICT(user_id, claim_key) DO UPDATE SET",
          "effect = excluded.effect,",
          "updated_at = excluded.updated_at",
        ].join(" "),
      )
      .bind(
        user.id,
        override.claimKey,
        override.effect,
        FIXTURE_TIMESTAMPS.createdAt,
        FIXTURE_TIMESTAMPS.updatedAt,
      ),
  );
}

function buildFixtureStatements(db, usersByStorageKey) {
  return [
    db.prepare("DELETE FROM posts WHERE slug = ?").bind(FIXTURE_POSTS[0].slug),
    db.prepare("DELETE FROM posts WHERE slug = ?").bind(FIXTURE_POSTS[1].slug),
    db.prepare("DELETE FROM projects WHERE slug = ?").bind(FIXTURE_PROJECT.slug),
    db.prepare("DELETE FROM skills WHERE slug = ?").bind(FIXTURE_SKILL.slug),
    db
      .prepare(
        [
          "INSERT INTO skills (id, icon_key, name, sort_order, slug, summary, created_at, updated_at)",
          "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ].join(" "),
      )
      .bind(
        FIXTURES.adminSkillId,
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
        FIXTURES.adminProjectId,
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
    ...FIXTURE_POSTS.map((post) =>
      db
        .prepare(
          [
            "INSERT INTO posts (id, author_id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at)",
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          ].join(" "),
        )
        .bind(
          post.id,
          usersByStorageKey[post.authorStorageKey].id,
          post.title,
          post.slug,
          post.excerpt,
          post.content,
          post.coverImageUrl,
          post.status,
          post.status === "published" ? FIXTURE_TIMESTAMPS.publishedAt : null,
          FIXTURE_TIMESTAMPS.createdAt,
          FIXTURE_TIMESTAMPS.updatedAt,
        ),
    ),
  ];
}

async function seedE2eFixtures() {
  const platform = await getPlatformProxy({
    persist: true,
    remoteBindings: false,
  });

  try {
    const db = platform.env.DB;
    const resolvedUsers = [];

    for (const user of FIXTURE_USERS) {
      resolvedUsers.push({
        ...user,
        id: await findExistingUserId(db, user.email, user.id),
      });
    }

    const usersByStorageKey = Object.fromEntries(
      resolvedUsers.map((user) => [user.storageKey, user]),
    );

    for (const user of resolvedUsers) {
      const passwordHash = await hashPassword(user.password);
      const accountId = await findExistingAccountId(db, user.id);

      await db.batch([
        ...buildUserBatchStatements(db, user, passwordHash, accountId),
        ...buildUserOverrideStatements(db, user),
      ]);
    }

    await db.batch(buildFixtureStatements(db, usersByStorageKey));

    console.log(
      JSON.stringify(
        {
          seeded: true,
          fixtures: {
            postSlugs: FIXTURE_POSTS.map((post) => post.slug),
            projectSlug: FIXTURE_PROJECT.slug,
            skillSlug: FIXTURE_SKILL.slug,
            users: resolvedUsers.map((user) => ({
              email: user.email,
              id: user.id,
              role: user.role,
              storageKey: user.storageKey,
            })),
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
