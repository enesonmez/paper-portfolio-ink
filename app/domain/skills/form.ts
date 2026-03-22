import { SKILL_DEFAULT_ICON, type SkillIconKey } from "~/domain/skills/icons";

export interface SkillFormValues {
  iconKey: SkillIconKey;
  name: string;
  sortOrder: string;
  summary: string;
}

export interface SkillFormState {
  errors?: Partial<Record<keyof SkillFormValues, string>> & {
    form?: string;
  };
  values: SkillFormValues;
}

export function getDefaultSkillFormValues(): SkillFormValues {
  return {
    iconKey: SKILL_DEFAULT_ICON,
    name: "",
    sortOrder: "0",
    summary: "",
  };
}

export function buildSkillFormValues(
  values: Partial<SkillFormValues> = {},
): SkillFormValues {
  return {
    ...getDefaultSkillFormValues(),
    ...values,
  };
}
