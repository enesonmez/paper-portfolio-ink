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

export const DASHBOARD_SKILLS_QUERY_PARAM = {
  edit: "edit",
  modal: "modal",
} as const;

export const DASHBOARD_SKILLS_MODAL = {
  create: "create",
  edit: "edit",
} as const;

export type DashboardSkillsModalMode = ValueOf<typeof DASHBOARD_SKILLS_MODAL>;
