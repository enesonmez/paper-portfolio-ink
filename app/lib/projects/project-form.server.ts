import { z } from "zod";

import {
  buildProjectFormValues,
  type ProjectFormState,
} from "~/features/projects/project-form.shared";
import {
  PROJECT_DEFAULT_STATUS,
  PROJECT_FORM_FIELD,
  PROJECT_STATUS_VALUES,
  type ProjectStatus,
} from "~/features/projects/project.shared";

const projectFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Proje basligi en az 3 karakter olmali.")
    .max(80, "Proje basligi en fazla 80 karakter olabilir."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug sadece kucuk harf, rakam ve tire icerebilir.")
    .min(3, "Slug en az 3 karakter olmali."),
  summary: z
    .string()
    .trim()
    .min(12, "Proje ozeti en az 12 karakter olmali.")
    .max(180, "Proje ozeti en fazla 180 karakter olabilir."),
  description: z.string().trim().max(3000, "Aciklama en fazla 3000 karakter olabilir."),
  repositoryUrl: z
    .string()
    .trim()
    .url("Gecerli bir repository URL gir.")
    .or(z.literal("")),
  liveUrl: z.string().trim().url("Gecerli bir live URL gir.").or(z.literal("")),
  coverImageUrl: z
    .string()
    .trim()
    .url("Gecerli bir kapak gorseli URL gir.")
    .or(z.literal("")),
  status: z.enum(PROJECT_STATUS_VALUES, {
    error: () => "Gecerli bir yayin durumu sec.",
  }),
  isFeatured: z.boolean(),
  sortOrder: z.coerce
    .number()
    .int("Siralama tam sayi olmali.")
    .min(0, "Siralama degeri 0 veya daha buyuk olmali."),
});

export type ProjectSubmission = z.infer<typeof projectFormSchema>;

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

  const parsed = projectFormSchema.safeParse(rawValues);

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
