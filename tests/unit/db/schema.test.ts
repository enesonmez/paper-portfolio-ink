import { getTableConfig } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";

import {
  accounts,
  locales,
  posts,
  projects,
  schema,
  sessions,
  skills,
  translations,
  users,
  verifications,
} from "#db/schema";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).columns.map((column) => column.name);
}

describe("database schema", () => {
  it("exports the domain tables through a shared schema object", () => {
    expect(schema).toMatchObject({
      accounts,
      posts,
      projects,
      sessions,
      skills,
      locales,
      translations,
      users,
      verifications,
    });
  });

  it("defines the users table with Better Auth-compatible profile columns", () => {
    const config = getTableConfig(users);

    expect(getColumnNames(users)).toEqual(
      expect.arrayContaining([
        "id",
        "email",
        "email_verified",
        "display_name",
        "is_active",
        "avatar_url",
        "role",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.indexes).toHaveLength(2);
  });

  it("defines the posts table with publishing metadata and author linkage", () => {
    const config = getTableConfig(posts);

    expect(getColumnNames(posts)).toEqual(
      expect.arrayContaining([
        "id",
        "author_id",
        "title",
        "slug",
        "excerpt",
        "content",
        "cover_image_url",
        "status",
        "published_at",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.foreignKeys).toHaveLength(1);
    expect(config.indexes).toHaveLength(3);
  });

  it("defines the projects table with visibility and sorting metadata", () => {
    const config = getTableConfig(projects);

    expect(getColumnNames(projects)).toEqual(
      expect.arrayContaining([
        "id",
        "title",
        "slug",
        "summary",
        "description",
        "repository_url",
        "live_url",
        "cover_image_url",
        "status",
        "is_featured",
        "sort_order",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.indexes).toHaveLength(3);
  });

  it("defines the skills table with unique slug metadata", () => {
    const config = getTableConfig(skills);

    expect(getColumnNames(skills)).toEqual(
      expect.arrayContaining([
        "id",
        "icon_key",
        "name",
        "sort_order",
        "slug",
        "summary",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.indexes).toHaveLength(2);
  });

  it("defines the locales table with active/default registry metadata", () => {
    const config = getTableConfig(locales);

    expect(getColumnNames(locales)).toEqual(
      expect.arrayContaining([
        "code",
        "label",
        "is_active",
        "is_default",
        "sort_order",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.indexes).toHaveLength(2);
  });

  it("defines the translations table with locale foreign key and composite identity", () => {
    const config = getTableConfig(translations);

    expect(getColumnNames(translations)).toEqual(
      expect.arrayContaining(["locale", "key", "value", "created_at", "updated_at"]),
    );
    expect(config.foreignKeys).toHaveLength(1);
    expect(config.indexes).toHaveLength(1);
  });

  it("defines the sessions table with Better Auth session columns", () => {
    const config = getTableConfig(sessions);

    expect(getColumnNames(sessions)).toEqual(
      expect.arrayContaining([
        "id",
        "user_id",
        "token",
        "expires_at",
        "ip_address",
        "user_agent",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.foreignKeys).toHaveLength(1);
    expect(config.indexes).toHaveLength(2);
  });

  it("defines the accounts table for credential and provider auth records", () => {
    const config = getTableConfig(accounts);

    expect(getColumnNames(accounts)).toEqual(
      expect.arrayContaining([
        "id",
        "user_id",
        "account_id",
        "provider_id",
        "access_token",
        "refresh_token",
        "id_token",
        "access_token_expires_at",
        "refresh_token_expires_at",
        "scope",
        "password",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.foreignKeys).toHaveLength(1);
    expect(config.indexes).toHaveLength(2);
  });

  it("defines the verifications table for auth verification flows", () => {
    const config = getTableConfig(verifications);

    expect(getColumnNames(verifications)).toEqual(
      expect.arrayContaining([
        "id",
        "identifier",
        "value",
        "expires_at",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.indexes).toHaveLength(1);
  });
});
