import { getTableConfig } from "drizzle-orm/sqlite-core";
import { describe, expect, it } from "vitest";

import { posts, projects, schema, sessions, users } from "../../db/schema";

function getColumnNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).columns.map((column) => column.name);
}

describe("database schema", () => {
  it("exports the domain tables through a shared schema object", () => {
    expect(schema).toMatchObject({
      posts,
      projects,
      sessions,
      users,
    });
  });

  it("defines the users table with auth and profile columns", () => {
    const config = getTableConfig(users);

    expect(getColumnNames(users)).toEqual(
      expect.arrayContaining([
        "id",
        "email",
        "email_verified",
        "display_name",
        "password_hash",
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

  it("defines the sessions table with hashed token storage and expiry", () => {
    const config = getTableConfig(sessions);

    expect(getColumnNames(sessions)).toEqual(
      expect.arrayContaining([
        "id",
        "user_id",
        "token_hash",
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
});
