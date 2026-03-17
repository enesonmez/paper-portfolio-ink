import { z } from "zod";

import {
  buildPostFormValues,
  type PostFormState,
} from "~/features/posts/post-form.shared";
import {
  getPostContentCharacterCount,
  normalizePostContentValue,
} from "~/features/posts/post-content.shared";
import {
  POST_DEFAULT_STATUS,
  POST_FORM_FIELD,
  POST_STATUS_VALUES,
  type PostStatus,
} from "~/features/posts/post.shared";

const postFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Yazi basligi en az 3 karakter olmali.")
    .max(120, "Yazi basligi en fazla 120 karakter olabilir."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug sadece kucuk harf, rakam ve tire icerebilir.")
    .min(3, "Slug en az 3 karakter olmali."),
  excerpt: z
    .string()
    .trim()
    .min(12, "Ozet en az 12 karakter olmali.")
    .max(240, "Ozet en fazla 240 karakter olabilir."),
  content: z
    .string()
    .trim()
    .refine(
      (value) => getPostContentCharacterCount(value) >= 20,
      "Yazi govdesi en az 20 karakter olmali.",
    )
    .refine(
      (value) => value.length <= 100000,
      "Yazi govdesi en fazla 100000 karakter olabilir.",
    )
    .transform((value) => normalizePostContentValue(value)),
  coverImageUrl: z
    .string()
    .trim()
    .url("Gecerli bir kapak gorseli URL gir.")
    .or(z.literal("")),
  status: z.enum(POST_STATUS_VALUES, {
    error: () => "Gecerli bir yayin durumu sec.",
  }),
});

export type PostSubmission = z.infer<typeof postFormSchema>;

function compactFieldErrors<T extends Record<string, string | undefined>>(errors: T) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => typeof value === "string"),
  ) as Partial<T>;
}

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export function parsePostFormData(
  formData: FormData,
): { data: PostSubmission } | PostFormState {
  const rawValues = {
    content: readStringField(formData, POST_FORM_FIELD.content),
    coverImageUrl: readStringField(formData, POST_FORM_FIELD.coverImageUrl),
    excerpt: readStringField(formData, POST_FORM_FIELD.excerpt),
    publishedAt: readStringField(formData, POST_FORM_FIELD.publishedAt),
    slug: readStringField(formData, POST_FORM_FIELD.slug),
    status: readStringField(formData, POST_FORM_FIELD.status) || POST_DEFAULT_STATUS,
    title: readStringField(formData, POST_FORM_FIELD.title),
  };

  const parsed = postFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: compactFieldErrors({
        content: fieldErrors.content?.[0],
        coverImageUrl: fieldErrors.coverImageUrl?.[0],
        excerpt: fieldErrors.excerpt?.[0],
        slug: fieldErrors.slug?.[0],
        status: fieldErrors.status?.[0],
        title: fieldErrors.title?.[0],
      }),
      values: buildPostFormValues({
        ...rawValues,
        status: POST_STATUS_VALUES.includes(rawValues.status as PostStatus)
          ? (rawValues.status as PostStatus)
          : POST_DEFAULT_STATUS,
      }),
    };
  }

  return {
    data: parsed.data,
  };
}

export function hasParsedPostData(
  submission: PostFormState | { data: PostSubmission },
): submission is { data: PostSubmission } {
  return "data" in submission;
}
