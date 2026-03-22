import { z } from "zod";

import { buildProjectFormValues, type ProjectFormState } from "~/domain/projects/form";
import {
  PROJECT_DEFAULT_STATUS,
  PROJECT_FORM_FIELD,
  PROJECT_STATUS_VALUES,
  type ProjectStatus,
} from "~/domain/projects/model";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

function createProjectFormSchema(t: I18nTranslator) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(3, t("validation.project.title.min"))
      .max(80, t("validation.project.title.max")),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/, t("validation.project.slug.pattern"))
      .min(3, t("validation.project.slug.min")),
    summary: z
      .string()
      .trim()
      .min(12, t("validation.project.summary.min"))
      .max(180, t("validation.project.summary.max")),
    description: z.string().trim().max(3000, t("validation.project.description.max")),
    repositoryUrl: z
      .string()
      .trim()
      .url(t("validation.project.repositoryUrl"))
      .or(z.literal("")),
    liveUrl: z.string().trim().url(t("validation.project.liveUrl")).or(z.literal("")),
    coverImageUrl: z
      .string()
      .trim()
      .url(t("validation.project.coverImageUrl"))
      .or(z.literal("")),
    status: z.enum(PROJECT_STATUS_VALUES, {
      error: () => t("validation.project.status"),
    }),
    isFeatured: z.boolean(),
    sortOrder: z.coerce
      .number()
      .int(t("validation.project.sortOrder.int"))
      .min(0, t("validation.project.sortOrder.min")),
  });
}

export type ProjectSubmission = z.infer<ReturnType<typeof createProjectFormSchema>>;

function compactFieldErrors<T extends Record<string, string | undefined>>(errors: T) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => typeof value === "string"),
  ) as Partial<T>;
}

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export function parseProjectFormData(
  formData: FormData,
  t: I18nTranslator,
): { data: ProjectSubmission } | ProjectFormState {
  const rawValues = {
    coverImageUrl: readStringField(formData, PROJECT_FORM_FIELD.coverImageUrl),
    description: readStringField(formData, PROJECT_FORM_FIELD.description),
    isFeatured: formData.get(PROJECT_FORM_FIELD.isFeatured) === "on",
    liveUrl: readStringField(formData, PROJECT_FORM_FIELD.liveUrl),
    repositoryUrl: readStringField(formData, PROJECT_FORM_FIELD.repositoryUrl),
    slug: readStringField(formData, PROJECT_FORM_FIELD.slug),
    sortOrder: readStringField(formData, PROJECT_FORM_FIELD.sortOrder) || "0",
    status:
      readStringField(formData, PROJECT_FORM_FIELD.status) || PROJECT_DEFAULT_STATUS,
    summary: readStringField(formData, PROJECT_FORM_FIELD.summary),
    title: readStringField(formData, PROJECT_FORM_FIELD.title),
  };

  const parsed = createProjectFormSchema(t).safeParse(rawValues);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: compactFieldErrors({
        coverImageUrl: fieldErrors.coverImageUrl?.[0],
        description: fieldErrors.description?.[0],
        liveUrl: fieldErrors.liveUrl?.[0],
        repositoryUrl: fieldErrors.repositoryUrl?.[0],
        slug: fieldErrors.slug?.[0],
        sortOrder: fieldErrors.sortOrder?.[0],
        status: fieldErrors.status?.[0],
        summary: fieldErrors.summary?.[0],
        title: fieldErrors.title?.[0],
      }),
      values: buildProjectFormValues({
        ...rawValues,
        status: PROJECT_STATUS_VALUES.includes(rawValues.status as ProjectStatus)
          ? (rawValues.status as ProjectStatus)
          : PROJECT_DEFAULT_STATUS,
      }),
    };
  }

  return {
    data: parsed.data,
  };
}

export function hasParsedProjectData(
  submission: ProjectFormState | { data: ProjectSubmission },
): submission is { data: ProjectSubmission } {
  return "data" in submission;
}
