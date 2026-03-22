import { z } from "zod";

import { buildSkillFormValues, type SkillFormState } from "~/domain/skills/form";
import {
  SKILL_DEFAULT_ICON,
  buildSkillIconOptions,
  isSkillIconKey,
  type SkillIconKey,
} from "~/domain/skills/icons";
import { SKILL_FORM_FIELD } from "~/domain/skills/model";
import { suggestSlugFromTitle } from "~/lib/slug";
import { compactFieldErrors, readStringField } from "~/shared/forms/form-data.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

function createSkillFormSchema(t: I18nTranslator) {
  const skillIconOptions = buildSkillIconOptions(t);

  return z.object({
    iconKey: z.enum(
      skillIconOptions.map((option) => option.value) as [
        SkillIconKey,
        ...SkillIconKey[],
      ],
      {
        error: () => t("validation.skill.icon"),
      },
    ),
    name: z
      .string()
      .trim()
      .min(2, t("validation.skill.name.min"))
      .max(48, t("validation.skill.name.max"))
      .refine(
        (value) => suggestSlugFromTitle(value).length > 0,
        t("validation.skill.name.slug"),
      ),
    summary: z
      .string()
      .trim()
      .min(12, t("validation.skill.summary.min"))
      .max(180, t("validation.skill.summary.max")),
    sortOrder: z.coerce
      .number()
      .int(t("validation.skill.sortOrder.int"))
      .min(0, t("validation.skill.sortOrder.min")),
  });
}

export type SkillSubmission = z.infer<ReturnType<typeof createSkillFormSchema>>;

export function parseSkillFormData(
  formData: FormData,
  t: I18nTranslator,
): { data: SkillSubmission } | SkillFormState {
  const rawValues = {
    iconKey: readStringField(formData, SKILL_FORM_FIELD.iconKey) || SKILL_DEFAULT_ICON,
    name: readStringField(formData, SKILL_FORM_FIELD.name),
    sortOrder: readStringField(formData, SKILL_FORM_FIELD.sortOrder) || "0",
    summary: readStringField(formData, SKILL_FORM_FIELD.summary),
  };

  const parsed = createSkillFormSchema(t).safeParse(rawValues);

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
