import { z } from "zod";

const projectStatusValues = ["draft", "published", "archived"] as const;

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
  status: z.enum(projectStatusValues, {
    error: () => "Gecerli bir yayin durumu sec.",
  }),
  isFeatured: z.boolean(),
  sortOrder: z.coerce
    .number()
    .int("Siralama tam sayi olmali.")
    .min(0, "Siralama degeri 0 veya daha buyuk olmali."),
});

export type ProjectStatus = (typeof projectStatusValues)[number];

export type ProjectFormValues = {
  coverImageUrl: string;
  description: string;
  isFeatured: boolean;
  liveUrl: string;
  repositoryUrl: string;
  slug: string;
  sortOrder: string;
  status: ProjectStatus;
  summary: string;
  title: string;
};

export type ProjectSubmission = z.infer<typeof projectFormSchema>;

export interface ProjectFormState {
  errors?: Partial<Record<keyof ProjectFormValues, string>> & {
    form?: string;
  };
  values: ProjectFormValues;
}

function compactFieldErrors<T extends Record<string, string | undefined>>(errors: T) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => typeof value === "string"),
  ) as Partial<T>;
}

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export function getDefaultProjectFormValues(): ProjectFormValues {
  return {
    coverImageUrl: "",
    description: "",
    isFeatured: false,
    liveUrl: "",
    repositoryUrl: "",
    slug: "",
    sortOrder: "0",
    status: "draft",
    summary: "",
    title: "",
  };
}

export function buildProjectFormValues(
  values: Partial<ProjectFormValues> = {},
): ProjectFormValues {
  return {
    ...getDefaultProjectFormValues(),
    ...values,
  };
}

export function parseProjectFormData(
  formData: FormData,
): { data: ProjectSubmission } | ProjectFormState {
  const rawValues = {
    coverImageUrl: readStringField(formData, "coverImageUrl"),
    description: readStringField(formData, "description"),
    isFeatured: formData.get("isFeatured") === "on",
    liveUrl: readStringField(formData, "liveUrl"),
    repositoryUrl: readStringField(formData, "repositoryUrl"),
    slug: readStringField(formData, "slug"),
    sortOrder: readStringField(formData, "sortOrder") || "0",
    status: readStringField(formData, "status") || "draft",
    summary: readStringField(formData, "summary"),
    title: readStringField(formData, "title"),
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
        status: projectStatusValues.includes(rawValues.status as ProjectStatus)
          ? (rawValues.status as ProjectStatus)
          : "draft",
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
