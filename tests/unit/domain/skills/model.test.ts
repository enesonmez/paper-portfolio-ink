import { describe, expect, it } from "vitest";

import {
  SKILL_FORM_FIELD,
  SKILL_MUTATION_INTENT,
  isSkillMutationIntent,
} from "~/domain/skills/model";

describe("skill model contracts", () => {
  it("keeps mutation intents and field names stable", () => {
    expect(SKILL_MUTATION_INTENT).toEqual({
      create: "create",
      delete: "delete",
      update: "update",
    });
    expect(SKILL_FORM_FIELD).toEqual({
      iconKey: "iconKey",
      intent: "intent",
      name: "name",
      sortOrder: "sortOrder",
      summary: "summary",
      skillId: "skillId",
    });
  });

  it("recognizes only supported mutation intents", () => {
    expect(isSkillMutationIntent("create")).toBe(true);
    expect(isSkillMutationIntent("update")).toBe(true);
    expect(isSkillMutationIntent("delete")).toBe(true);
    expect(isSkillMutationIntent("archive")).toBe(false);
  });
});
