type ValueOf<T> = T[keyof T];

export const SKILL_MUTATION_INTENT = {
  create: "create",
  delete: "delete",
  update: "update",
} as const;

export type SkillMutationIntent = ValueOf<typeof SKILL_MUTATION_INTENT>;

export const SKILL_FORM_FIELD = {
  iconKey: "iconKey",
  intent: "intent",
  name: "name",
  sortOrder: "sortOrder",
  summary: "summary",
  skillId: "skillId",
} as const;
