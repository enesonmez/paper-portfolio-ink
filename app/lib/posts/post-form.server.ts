import { z } from "zod";

import { buildPostFormValues, type PostFormState } from "~/domain/posts/form";
import {
  getPostContentCharacterCount,
  normalizePostContentValue,
} from "~/domain/posts/content";
import {
  POST_DEFAULT_STATUS,
  POST_FORM_FIELD,
  POST_STATUS_VALUES,
  type PostStatus,
} from "~/domain/posts/model";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

function createPostFormSchema(t: I18nTranslator) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(3, t("validation.post.title.min"))
      .max(120, t("validation.post.title.max")),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/, t("validation.post.slug.pattern"))
      .min(3, t("validation.post.slug.min")),
    excerpt: z
      .string()
      .trim()
      .min(12, t("validation.post.excerpt.min"))
      .max(240, t("validation.post.excerpt.max")),
    content: z
      .string()
      .trim()
      .refine(
        (value) => getPostContentCharacterCount(value) >= 20,
        t("validation.post.content.min"),
      )
      .refine((value) => value.length <= 100000, t("validation.post.content.max"))
      .transform((value) => normalizePostContentValue(value)),
    coverImageUrl: z
      .string()
      .trim()
      .url(t("validation.post.coverImageUrl"))
      .or(z.literal("")),
    status: z.enum(POST_STATUS_VALUES, {
      error: () => t("validation.post.status"),
    }),
  });
}

export type PostSubmission = z.infer<ReturnType<typeof createPostFormSchema>>;

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
  t: I18nTranslator,
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

  const parsed = createPostFormSchema(t).safeParse(rawValues);

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
