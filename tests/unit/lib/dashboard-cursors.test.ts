import { describe, expect, it } from "vitest";

import {
  buildDashboardPostsCursor,
  parseDashboardPostsCursor,
} from "~/lib/posts/posts.server";
import {
  buildDashboardProjectsCursor,
  parseDashboardProjectsCursor,
} from "~/lib/projects/projects.server";
import {
  buildDashboardSkillsCursor,
  parseDashboardSkillsCursor,
} from "~/lib/skills/skills.server";
import {
  buildDashboardUsersCursor,
  parseDashboardUsersCursor,
} from "~/lib/users/users.server";

describe("dashboard cursor parsers", () => {
  it("parses valid post, project, skill, and user cursors", () => {
    expect(
      parseDashboardPostsCursor(
        buildDashboardPostsCursor({
          createdAtIso: "2026-05-26T07:00:00.000Z",
          slug: "edge-runtime-notes",
          updatedAtIso: "2026-05-26T08:00:00.000Z",
        }),
      ),
    ).toEqual({
      createdAt: new Date("2026-05-26T07:00:00.000Z"),
      slug: "edge-runtime-notes",
      updatedAt: new Date("2026-05-26T08:00:00.000Z"),
    });

    expect(
      parseDashboardProjectsCursor(
        buildDashboardProjectsCursor({
          createdAtIso: "2026-05-26T07:00:00.000Z",
          isFeatured: true,
          slug: "edge-project",
          sortOrder: 2,
        }),
      ),
    ).toEqual({
      createdAt: new Date("2026-05-26T07:00:00.000Z"),
      isFeatured: true,
      slug: "edge-project",
      sortOrder: 2,
    });

    expect(
      parseDashboardSkillsCursor(
        buildDashboardSkillsCursor({
          createdAtIso: "2026-05-26T07:00:00.000Z",
          name: "Cloudflare Workers",
          slug: "cloudflare-workers",
          sortOrder: 1,
        }),
      ),
    ).toEqual({
      createdAt: new Date("2026-05-26T07:00:00.000Z"),
      name: "Cloudflare Workers",
      slug: "cloudflare-workers",
      sortOrder: 1,
    });

    expect(
      parseDashboardUsersCursor(
        buildDashboardUsersCursor({
          displayName: "Ada Lovelace",
          email: "ada@example.com",
          id: "user-1",
          isActive: true,
          role: "admin",
        }),
      ),
    ).toEqual({
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      id: "user-1",
      isActive: true,
      role: "admin",
    });
  });

  it("rejects malformed dashboard cursor payloads", () => {
    expect(
      parseDashboardPostsCursor(
        '{"createdAtIso":"invalid","slug":"","updatedAtIso":"2026-05-26T08:00:00.000Z"}',
      ),
    ).toBeNull();
    expect(
      parseDashboardProjectsCursor(
        '{"createdAtIso":"2026-05-26T07:00:00.000Z","isFeatured":"yes","slug":"edge-project","sortOrder":2}',
      ),
    ).toBeNull();
    expect(
      parseDashboardSkillsCursor(
        '{"createdAtIso":"2026-05-26T07:00:00.000Z","name":" ","slug":"cloudflare-workers","sortOrder":1}',
      ),
    ).toBeNull();
    expect(
      parseDashboardUsersCursor(
        '{"displayName":"Ada","email":"not-an-email","id":"user-1","isActive":true,"role":"admin"}',
      ),
    ).toBeNull();
  });
});
