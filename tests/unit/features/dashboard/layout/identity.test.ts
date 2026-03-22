import { describe, expect, it } from "vitest";

describe("dashboard layout shared helpers", () => {
  it("builds dashboard identity with trimmed values and initials", async () => {
    const { buildDashboardIdentity } =
      await import("~/features/dashboard/layout/identity");

    expect(
      buildDashboardIdentity({
        claims: ["dashboard.access", "posts.create"],
        displayName: "  Enes Oz  ",
        email: "  admin@paper-portfolio-ink.dev ",
        role: "  admin ",
      }),
    ).toEqual({
      claims: ["dashboard.access", "posts.create"],
      displayName: "Enes Oz",
      email: "admin@paper-portfolio-ink.dev",
      id: null,
      initials: "EO",
      role: "admin",
    });
  });

  it("falls back to stable defaults when identity fields are missing", async () => {
    const { buildDashboardIdentity } =
      await import("~/features/dashboard/layout/identity");

    expect(buildDashboardIdentity({})).toEqual({
      claims: [],
      displayName: "Paper Ink",
      email: "-",
      id: null,
      initials: "PI",
      role: "-",
    });
  });
});
