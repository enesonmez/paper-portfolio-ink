import { z } from "zod";

import { buildProjectFormValues, type ProjectFormState } from "~/domain/projects/form";
import {
  PROJECT_DEFAULT_STATUS,
  PROJECT_FORM_FIELD,
  PROJECT_STATUS_VALUES,
  type ProjectStatus,
} from "~/domain/projects/model";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { compactFieldErrors, readStringField } from "~/shared/forms/form-data.server";
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

export function parseProjectFormData(
  formData: FormData,
  t: I18nTranslator,
): ProjectSubmission {
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
    const errors = compactFieldErrors({
      coverImageUrl: fieldErrors.coverImageUrl?.[0],
      description: fieldErrors.description?.[0],
      liveUrl: fieldErrors.liveUrl?.[0],
      repositoryUrl: fieldErrors.repositoryUrl?.[0],
      slug: fieldErrors.slug?.[0],
      sortOrder: fieldErrors.sortOrder?.[0],
      status: fieldErrors.status?.[0],
      summary: fieldErrors.summary?.[0],
      title: fieldErrors.title?.[0],
    });

    throw buildValidationError<ProjectFormState>({
      action: APP_ERROR_ACTION.validate,
      code: APP_ERROR_CODE.projects.validation,
      details: {
        invalidFields: Object.keys(errors),
      },
      message: "Project form validation failed",
      resource: APP_ERROR_RESOURCE.projects,
      responseData: {
        errors,
        values: buildProjectFormValues({
          ...rawValues,
          status: PROJECT_STATUS_VALUES.includes(rawValues.status as ProjectStatus)
            ? (rawValues.status as ProjectStatus)
            : PROJECT_DEFAULT_STATUS,
        }),
      },
    });
  }

  return parsed.data;
}
