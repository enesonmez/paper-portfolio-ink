import { z } from "zod";

import {
  buildSkillFormValues,
  type SkillFormState,
} from "~/features/skills/skill-form.shared";
import {
  SKILL_DEFAULT_ICON,
  SKILL_ICON_OPTIONS,
  isSkillIconKey,
  type SkillIconKey,
} from "~/features/skills/skill-icon.shared";
import { SKILL_FORM_FIELD } from "~/features/skills/skill.shared";
import { suggestSlugFromTitle } from "~/lib/slug";

const skillFormSchema = z.object({
  iconKey: z.enum(
    SKILL_ICON_OPTIONS.map((option) => option.value) as [
      SkillIconKey,
      ...SkillIconKey[],
    ],
    {
      error: () => "Gecerli bir ikon sec.",
    },
  ),
  name: z
    .string()
    .trim()
    .min(2, "Beceri adi en az 2 karakter olmali.")
    .max(48, "Beceri adi en fazla 48 karakter olabilir.")
    .refine(
      (value) => suggestSlugFromTitle(value).length > 0,
      "Beceri adi gecerli bir anahtar uretemedi.",
    ),
  summary: z
    .string()
    .trim()
    .min(12, "Beceri ozeti en az 12 karakter olmali.")
    .max(180, "Beceri ozeti en fazla 180 karakter olabilir."),
  sortOrder: z.coerce
    .number()
    .int("Siralama tam sayi olmali.")
    .min(0, "Siralama degeri 0 veya daha buyuk olmali."),
});

export type SkillSubmission = z.infer<typeof skillFormSchema>;

function compactFieldErrors<T extends Record<string, string | undefined>>(errors: T) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => typeof value === "string"),
  ) as Partial<T>;
}

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export function parseSkillFormData(
  formData: FormData,
): { data: SkillSubmission } | SkillFormState {
  const rawValues = {
    iconKey: readStringField(formData, SKILL_FORM_FIELD.iconKey) || SKILL_DEFAULT_ICON,
    name: readStringField(formData, SKILL_FORM_FIELD.name),
    sortOrder: readStringField(formData, SKILL_FORM_FIELD.sortOrder) || "0",
    summary: readStringField(formData, SKILL_FORM_FIELD.summary),
  };

  const parsed = skillFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: compactFieldErrors({
        iconKey: fieldErrors.iconKey?.[0],
        name: fieldErrors.name?.[0],
        sortOrder: fieldErrors.sortOrder?.[0],
        summary: fieldErrors.summary?.[0],
      }),
      values: buildSkillFormValues({
        ...rawValues,
        iconKey: isSkillIconKey(rawValues.iconKey)
          ? rawValues.iconKey
          : SKILL_DEFAULT_ICON,
      }),
    };
  }

  return {
    data: parsed.data,
  };
}

export function hasParsedSkillData(
  submission: SkillFormState | { data: SkillSubmission },
): submission is { data: SkillSubmission } {
  return "data" in submission;
}
