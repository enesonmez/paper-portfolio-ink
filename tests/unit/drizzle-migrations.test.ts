import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import drizzleConfig from "../../drizzle.config";

const migrationsDir = resolve(process.cwd(), "db/migrations");

describe("drizzle migration workflow", () => {
  it("configures drizzle-kit against the shared sqlite schema output", () => {
    expect(drizzleConfig.dialect).toBe("sqlite");
    expect(drizzleConfig.schema).toBe("./db/schema.ts");
    expect(drizzleConfig.out).toBe("./db/migrations");
  });

  it("contains an initial SQL migration for the core domain tables", () => {
    const migrationFiles = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    expect(migrationFiles.length).toBeGreaterThan(0);

    const firstMigration = readFileSync(
      resolve(migrationsDir, migrationFiles[0]),
      "utf8",
    );

    expect(firstMigration).toContain("CREATE TABLE `users`");
    expect(firstMigration).toContain("CREATE TABLE `posts`");
    expect(firstMigration).toContain("CREATE TABLE `projects`");
    expect(firstMigration).toContain("CREATE TABLE `sessions`");
  });
});
