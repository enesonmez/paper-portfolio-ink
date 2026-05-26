import { describe, expect, it } from "vitest";

import {
  buildDashboardSkillsHref,
  buildDashboardSkillsMetrics,
  mergeDashboardSkillsFormState,
  resolveDashboardSkillsForm,
} from "~/features/dashboard/skills/state";

describe("dashboard skills state helpers", () => {
  it("builds stable hrefs and metrics from skill rows", () => {
    expect(
      buildDashboardSkillsHref({
        search: "cloudflare",
        editId: "skill-1",
      }),
    ).toBe("/dashboard/skills?search=cloudflare&edit=skill-1");
    expect(buildDashboardSkillsMetrics(1)).toEqual({
      totalCount: 1,
    });
  });

  it("resolves edit mode from query params and clears errors when no action data exists", () => {
    const loaderForm = resolveDashboardSkillsForm({
      editId: "skill-1",
      modal: null,
      skills: [
        {
          createdAtLabel: "2026-03-20",
          iconKey: "workflow",
          id: "skill-1",
          name: "React Router",
          slug: "react-router",
          sortOrder: 2,
          summary: "Typed route contracts.",
        },
      ],
    });

    expect(loaderForm).toEqual({
      editingSkillId: "skill-1",
      errors: undefined,
      isOpen: true,
      mode: "edit",
      values: {
        iconKey: "workflow",
        name: "React Router",
        sortOrder: "2",
        summary: "Typed route contracts.",
      },
    });
    expect(mergeDashboardSkillsFormState(loaderForm)).toEqual({
      editingSkillId: "skill-1",
      errors: undefined,
      isOpen: true,
      mode: "edit",
      values: {
        iconKey: "workflow",
        name: "React Router",
        sortOrder: "2",
        summary: "Typed route contracts.",
      },
    });
  });
});
