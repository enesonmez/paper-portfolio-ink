import { describe, expect, it } from "vitest";

describe("dashboard layout shared helpers", () => {
  it("builds dashboard identity with trimmed values and initials", async () => {
    const { buildDashboardIdentity } = await import(
      "../../app/features/dashboard/layout/dashboard-layout.shared"
    );

    expect(
      buildDashboardIdentity({
        displayName: "  Enes Oz  ",
        email: "  admin@paper-portfolio-ink.dev ",
        role: "  admin ",
      }),
    ).toEqual({
      displayName: "Enes Oz",
      email: "admin@paper-portfolio-ink.dev",
      initials: "EO",
      role: "admin",
    });
  });

  it("falls back to stable defaults when identity fields are missing", async () => {
    const { buildDashboardIdentity } = await import(
      "../../app/features/dashboard/layout/dashboard-layout.shared"
    );

    expect(buildDashboardIdentity({})).toEqual({
      displayName: "Paper Enes Ink",
      email: "-",
      initials: "PE",
      role: "-",
    });
  });
});
