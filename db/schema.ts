import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export type UserRole = "admin" | "author";
type PublishingStatus = "draft" | "published" | "archived";

function createIdColumn() {
  return text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
}

function createTimestampColumns() {
  return {
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  };
}

export const users = sqliteTable(
  "users",
  {
    id: createIdColumn(),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    displayName: text("display_name").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    role: text("role").$type<UserRole>().notNull().default("admin"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_role_idx").on(table.role),
  ],
);

export const posts = sqliteTable(
  "posts",
  {
    id: createIdColumn(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImageUrl: text("cover_image_url"),
    status: text("status").$type<PublishingStatus>().notNull().default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    index("posts_author_id_idx").on(table.authorId),
    index("posts_status_published_at_idx").on(table.status, table.publishedAt),
  ],
);

export const projects = sqliteTable(
  "projects",
  {
    id: createIdColumn(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary").notNull(),
    description: text("description"),
    repositoryUrl: text("repository_url"),
    liveUrl: text("live_url"),
    coverImageUrl: text("cover_image_url"),
    status: text("status").$type<PublishingStatus>().notNull().default("draft"),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("projects_slug_unique").on(table.slug),
    index("projects_status_idx").on(table.status),
    index("projects_featured_sort_order_idx").on(table.isFeatured, table.sortOrder),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: createIdColumn(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("sessions_token_unique").on(table.token),
    index("sessions_user_id_expires_at_idx").on(table.userId, table.expiresAt),
  ],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: createIdColumn(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
    index("accounts_user_id_idx").on(table.userId),
  ],
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: createIdColumn(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("verifications_identifier_value_unique").on(
      table.identifier,
      table.value,
    ),
  ],
);

export const schema = {
  users,
  posts,
  projects,
  sessions,
  accounts,
  verifications,
};
