import { useT } from "~/features/i18n/i18n-react";
import type { I18nTranslator } from "~/features/i18n/i18n.shared";

type ValueOf<T> = T[keyof T];

export const POST_STATUS = {
  archived: "archived",
  draft: "draft",
  published: "published",
} as const;

export type PostStatus = ValueOf<typeof POST_STATUS>;

export const POST_STATUS_VALUES = [
  POST_STATUS.draft,
  POST_STATUS.published,
  POST_STATUS.archived,
] as const;

export const POST_DEFAULT_STATUS = POST_STATUS.draft;

export interface PostStatusOption {
  label: string;
  value: PostStatus;
}

export function buildPostStatusOptions(t: I18nTranslator): readonly PostStatusOption[] {
  return [
    {
      label: t("model.postStatus.draft"),
      value: POST_STATUS.draft,
    },
    {
      label: t("model.postStatus.published"),
      value: POST_STATUS.published,
    },
    {
      label: t("model.postStatus.archived"),
      value: POST_STATUS.archived,
    },
  ];
}

export function usePostStatusOptions() {
  const t = useT();

  return buildPostStatusOptions(t);
}

export const POST_MUTATION_INTENT = {
  create: "create",
  delete: "delete",
  update: "update",
} as const;

export type PostMutationIntent = ValueOf<typeof POST_MUTATION_INTENT>;

export const POST_FORM_FIELD = {
  content: "content",
  coverImageUrl: "coverImageUrl",
  excerpt: "excerpt",
  intent: "intent",
  postId: "postId",
  publishedAt: "publishedAt",
  slug: "slug",
  status: "status",
  title: "title",
} as const;

export const DASHBOARD_POSTS_QUERY_PARAM = {
  edit: "edit",
  presentation: "presentation",
  modal: "modal",
} as const;

export const DASHBOARD_POSTS_MODAL = {
  create: "create",
  edit: "edit",
} as const;

export type DashboardPostsModalMode = ValueOf<typeof DASHBOARD_POSTS_MODAL>;

export const DASHBOARD_POSTS_PRESENTATION = {
  fullscreen: "fullscreen",
  modal: "modal",
} as const;

export type DashboardPostsPresentationMode = ValueOf<
  typeof DASHBOARD_POSTS_PRESENTATION
>;
