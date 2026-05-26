import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export type UserRole = "admin" | "author";
export type AuthorizationClaimScope = "any" | "global" | "own";
export type AuthorizationEffect = "grant" | "revoke";
export type AuthorizationStateKey = "global";
export type LoginRateLimitScope = "email" | "ip";
type PublishingStatus = "draft" | "published" | "archived";
export type LogHistoryResult = "failure" | "success";
export type LogSeverity = "critical" | "error" | "info" | "warn";

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

function createCreatedAtColumn() {
  return integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);
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
    authzVersion: integer("authz_version").notNull().default(1),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_dashboard_registry_idx").on(
      sql`${table.isActive} desc`,
      sql`${table.role} asc`,
      sql`${table.displayName} asc`,
      sql`${table.email} asc`,
      sql`${table.id} asc`,
    ),
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
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull(),
    coverImageUrl: text("cover_image_url"),
    readingTimeMinutes: integer("reading_time_minutes").notNull().default(1),
    status: text("status").$type<PublishingStatus>().notNull().default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    index("posts_status_feed_idx").on(
      table.status,
      sql`${table.publishedAt} desc`,
      sql`${table.updatedAt} desc`,
      sql`${table.createdAt} desc`,
      sql`${table.slug} asc`,
    ),
    index("posts_dashboard_status_idx").on(
      table.status,
      sql`${table.updatedAt} desc`,
      sql`${table.createdAt} desc`,
      sql`${table.slug} asc`,
    ),
    index("posts_author_feed_idx").on(
      table.authorId,
      sql`${table.publishedAt} desc`,
      sql`${table.updatedAt} desc`,
      sql`${table.createdAt} desc`,
      sql`${table.slug} asc`,
    ),
    index("posts_dashboard_author_idx").on(
      table.authorId,
      sql`${table.updatedAt} desc`,
      sql`${table.createdAt} desc`,
      sql`${table.slug} asc`,
    ),
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
    index("projects_status_feed_idx").on(
      table.status,
      sql`${table.isFeatured} desc`,
      sql`${table.sortOrder} asc`,
      sql`${table.createdAt} desc`,
      sql`${table.slug} asc`,
    ),
    index("projects_dashboard_order_idx").on(
      sql`${table.isFeatured} desc`,
      sql`${table.sortOrder} asc`,
      sql`${table.createdAt} desc`,
      sql`${table.slug} asc`,
    ),
  ],
);

export const skills = sqliteTable(
  "skills",
  {
    id: createIdColumn(),
    iconKey: text("icon_key").notNull().default("workflow"),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    slug: text("slug").notNull(),
    summary: text("summary").notNull().default(""),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("skills_slug_unique").on(table.slug),
    index("skills_registry_idx").on(
      sql`${table.sortOrder} asc`,
      sql`${table.name} asc`,
      sql`${table.createdAt} asc`,
      sql`${table.slug} asc`,
    ),
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

export const authorizationClaims = sqliteTable(
  "authorization_claims",
  {
    key: text("key").primaryKey(),
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    scope: text("scope").$type<AuthorizationClaimScope>(),
    description: text("description"),
    ...createTimestampColumns(),
  },
  (table) => [
    index("authorization_claims_resource_action_idx").on(table.resource, table.action),
  ],
);

export const authorizationRoleClaims = sqliteTable(
  "authorization_role_claims",
  {
    role: text("role").$type<UserRole>().notNull(),
    claimKey: text("claim_key")
      .notNull()
      .references(() => authorizationClaims.key, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    ...createTimestampColumns(),
  },
  (table) => [
    primaryKey({
      columns: [table.role, table.claimKey],
      name: "authorization_role_claims_role_claim_key_pk",
    }),
    index("authorization_role_claims_claim_key_idx").on(table.claimKey),
  ],
);

export const authorizationUserClaimOverrides = sqliteTable(
  "authorization_user_claim_overrides",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    claimKey: text("claim_key")
      .notNull()
      .references(() => authorizationClaims.key, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    effect: text("effect").$type<AuthorizationEffect>().notNull(),
    ...createTimestampColumns(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.claimKey],
      name: "authorization_user_claim_overrides_user_claim_key_pk",
    }),
    index("authorization_user_claim_overrides_claim_key_idx").on(table.claimKey),
    check(
      "authorization_user_claim_overrides_effect_check",
      sql`${table.effect} in ('grant', 'revoke')`,
    ),
  ],
);

export const authorizationState = sqliteTable(
  "authorization_state",
  {
    key: text("key").$type<AuthorizationStateKey>().primaryKey(),
    revision: integer("revision").notNull().default(1),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    check("authorization_state_key_check", sql`${table.key} = 'global'`),
    check("authorization_state_revision_check", sql`${table.revision} >= 1`),
  ],
);

export const locales = sqliteTable(
  "locales",
  {
    code: text("code").primaryKey(),
    label: text("label").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...createTimestampColumns(),
  },
  (table) => [
    index("locales_is_active_idx").on(table.isActive),
    index("locales_sort_order_idx").on(table.sortOrder),
    check("locales_code_lowercase_check", sql`${table.code} = lower(${table.code})`),
    check("locales_code_length_check", sql`length(${table.code}) between 2 and 35`),
    check("locales_code_spacing_check", sql`instr(${table.code}, ' ') = 0`),
    check(
      "locales_code_dash_check",
      sql`${table.code} not like '-%' and ${table.code} not like '%-' and ${table.code} not like '%--%'`,
    ),
  ],
);

export const translations = sqliteTable(
  "translations",
  {
    locale: text("locale")
      .notNull()
      .references(() => locales.code, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    ...createTimestampColumns(),
  },
  (table) => [
    primaryKey({
      columns: [table.locale, table.key],
      name: "translations_locale_key_pk",
    }),
  ],
);

export const configurationParameters = sqliteTable(
  "configuration_parameters",
  {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    ...createTimestampColumns(),
  },
  (table) => [
    check(
      "configuration_parameters_key_length_check",
      sql`length(${table.key}) between 3 and 120`,
    ),
    check(
      "configuration_parameters_key_spacing_check",
      sql`instr(${table.key}, ' ') = 0`,
    ),
  ],
);

export const loginRateLimits = sqliteTable(
  "login_rate_limits",
  {
    scope: text("scope").$type<LoginRateLimitScope>().notNull(),
    identifierHash: text("identifier_hash").notNull(),
    failureCount: integer("failure_count").notNull().default(0),
    windowStartedAt: integer("window_started_at", {
      mode: "timestamp_ms",
    }).notNull(),
    blockedUntil: integer("blocked_until", {
      mode: "timestamp_ms",
    }),
    ...createTimestampColumns(),
  },
  (table) => [
    primaryKey({
      columns: [table.scope, table.identifierHash],
      name: "login_rate_limits_scope_identifier_hash_pk",
    }),
    index("login_rate_limits_blocked_until_idx").on(table.blockedUntil),
    check("login_rate_limits_failure_count_check", sql`${table.failureCount} >= 0`),
    check("login_rate_limits_scope_check", sql`${table.scope} in ('email', 'ip')`),
  ],
);

export const logHistory = sqliteTable(
  "log_history",
  {
    id: createIdColumn(),
    requestId: text("request_id").notNull(),
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    result: text("result").$type<LogHistoryResult>().notNull(),
    statusCode: integer("status_code").notNull(),
    message: text("message").notNull(),
    path: text("path").notNull(),
    method: text("method").notNull(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    userRole: text("user_role").$type<UserRole>(),
    targetId: text("target_id"),
    targetLabel: text("target_label"),
    metadataJson: text("metadata_json").notNull().default("{}"),
    createdAt: createCreatedAtColumn(),
  },
  (table) => [
    index("log_history_created_at_id_idx").on(table.createdAt, table.id),
    index("log_history_request_id_idx").on(table.requestId),
    index("log_history_resource_action_idx").on(table.resource, table.action),
    index("log_history_user_id_idx").on(table.userId),
    check("log_history_result_check", sql`${table.result} in ('failure', 'success')`),
  ],
);

export const logErrorHistory = sqliteTable(
  "log_error_history",
  {
    id: createIdColumn(),
    requestId: text("request_id").notNull(),
    fingerprint: text("fingerprint").notNull(),
    code: text("code").notNull(),
    category: text("category").notNull(),
    severity: text("severity").$type<LogSeverity>().notNull(),
    statusCode: integer("status_code").notNull(),
    message: text("message").notNull(),
    path: text("path").notNull(),
    method: text("method").notNull(),
    routeId: text("route_id"),
    locale: text("locale"),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    userRole: text("user_role").$type<UserRole>(),
    stack: text("stack"),
    metadataJson: text("metadata_json").notNull().default("{}"),
    createdAt: createCreatedAtColumn(),
  },
  (table) => [
    index("log_error_history_created_at_id_idx").on(table.createdAt, table.id),
    index("log_error_history_request_id_idx").on(table.requestId),
    index("log_error_history_fingerprint_idx").on(table.fingerprint),
    index("log_error_history_code_idx").on(table.code),
    index("log_error_history_user_id_idx").on(table.userId),
    check(
      "log_error_history_severity_check",
      sql`${table.severity} in ('critical', 'error', 'info', 'warn')`,
    ),
  ],
);

export const schema = {
  users,
  posts,
  projects,
  skills,
  sessions,
  accounts,
  verifications,
  authorizationClaims,
  authorizationRoleClaims,
  authorizationUserClaimOverrides,
  authorizationState,
  locales,
  translations,
  configurationParameters,
  loginRateLimits,
  logHistory,
  logErrorHistory,
};
