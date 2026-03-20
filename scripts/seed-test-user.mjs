import { hashPassword } from "better-auth/crypto";
import { getPlatformProxy } from "wrangler";

const DEFAULT_USER = {
  displayName: "Enes Test Admin",
  email: "admin@paper-portfolio-ink.local",
  password: "PaperInk1234!",
  role: "admin",
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

async function seedTestUser() {
  const testUser = readSeedUser();
  const platform = await getPlatformProxy({
    persist: true,
    remoteBindings: false,
  });

  try {
    const db = platform.env.DB;
    const userId = await findExistingUserId(db, testUser.email);
    const accountId = await findExistingAccountId(db, userId);
    const passwordHash = await hashPassword(testUser.password);
    const timestamp = Date.now();

    await db.batch([
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
          testUser.email,
          testUser.displayName,
          testUser.role,
          timestamp,
          timestamp,
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
        .bind(accountId, userId, userId, passwordHash, timestamp, timestamp),
    ]);

    console.log(
      JSON.stringify(
        {
          seeded: true,
          email: testUser.email,
          password: testUser.password,
          role: testUser.role,
          userId,
        },
        null,
        2,
      ),
    );
  } finally {
    await platform.dispose();
  }
}

await seedTestUser();
