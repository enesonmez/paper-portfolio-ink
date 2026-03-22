import { getDefaultPostContentValue } from "./content";
import { POST_DEFAULT_STATUS, type PostStatus } from "./model";

export type PostFormValues = {
  content: string;
  coverImageUrl: string;
  excerpt: string;
  slug: string;
  status: PostStatus;
  title: string;
};

export interface PostFormState {
  errors?: Partial<Record<keyof PostFormValues, string>> & {
    form?: string;
  };
  slugSuggestion?: string | null;
  values: PostFormValues;
}

export function getDefaultPostFormValues(): PostFormValues {
  return {
    content: getDefaultPostContentValue(),
    coverImageUrl: "",
    excerpt: "",
    slug: "",
    status: POST_DEFAULT_STATUS,
    title: "",
  };
}

export function buildPostFormValues(
  values: Partial<PostFormValues> = {},
): PostFormValues {
  return {
    ...getDefaultPostFormValues(),
    ...values,
  };
}
