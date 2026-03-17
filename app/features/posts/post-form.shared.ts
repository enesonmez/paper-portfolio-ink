import { getDefaultPostContentValue } from "./post-content.shared";
import { POST_DEFAULT_STATUS, type PostStatus } from "./post.shared";

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
