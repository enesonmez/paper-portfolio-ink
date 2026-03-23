import {
  buildPostFormValues,
  type PostFormState,
  type PostFormValues,
} from "~/domain/posts/form";
import {
  POST_STATUS,
  buildPostStatusOptions,
  type PostStatus,
} from "~/domain/posts/model";
import { useT } from "~/shared/i18n/i18n-react";
import type { PostOverview } from "~/lib/posts/posts.server";

type ValueOf<T> = T[keyof T];

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

export type DashboardStatusTone = "danger" | "neutral" | "success" | "warning";

export interface DashboardPostsMetrics {
  draftCount: number;
  publishedCount: number;
  totalCount: number;
}

export interface DashboardPostsPermissions {
  canCreate: boolean;
  canDelete: boolean;
  canUpdate: boolean;
}

export interface DashboardPostsFormState {
  editingPostId: string | null;
  errors?: PostFormState["errors"];
  isOpen: boolean;
  mode: DashboardPostsModalMode | null;
  presentation: DashboardPostsPresentationMode;
  slugSuggestion?: string | null;
  values: PostFormValues;
}

export interface DashboardPostsGrantedLoaderData {
  access: "granted";
  form: DashboardPostsFormState;
  metrics: DashboardPostsMetrics;
  permissions: DashboardPostsPermissions;
  posts: PostOverview[];
}

export interface DashboardPostsDeniedLoaderData {
  access: "denied";
  form: DashboardPostsFormState;
  metrics: DashboardPostsMetrics;
  permissions: DashboardPostsPermissions;
  posts: PostOverview[];
}

export type DashboardPostsLoaderData =
  | DashboardPostsDeniedLoaderData
  | DashboardPostsGrantedLoaderData;

export interface DashboardPostsHrefParams {
  editId?: string | null;
  modal?: Extract<DashboardPostsModalMode, "create"> | null;
  presentation?: DashboardPostsPresentationMode | null;
}

interface ResolveDashboardPostsFormArgs {
  editId: string | null;
  modal: string | null;
  posts: PostOverview[];
}

interface BuildDashboardPostsFormStateArgs {
  editingPostId?: string | null;
  errors?: PostFormState["errors"];
  mode: DashboardPostsModalMode | null;
  presentation?: DashboardPostsPresentationMode;
  slugSuggestion?: string | null;
  values: PostFormValues;
}

function toPostFormValues(post: PostOverview): PostFormValues {
  return buildPostFormValues({
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? "",
    excerpt: post.excerpt,
    slug: post.slug,
    status: post.status,
    title: post.title,
  });
}

function buildDashboardPostsFormState({
  editingPostId,
  errors,
  mode,
  presentation,
  slugSuggestion,
  values,
}: BuildDashboardPostsFormStateArgs): DashboardPostsFormState {
  return {
    editingPostId: editingPostId ?? null,
    errors,
    isOpen: mode !== null,
    mode,
    presentation:
      presentation ??
      (mode !== null
        ? DASHBOARD_POSTS_PRESENTATION.fullscreen
        : DASHBOARD_POSTS_PRESENTATION.modal),
    slugSuggestion: slugSuggestion ?? null,
    values,
  };
}

export function buildDashboardPostsHref(params: DashboardPostsHrefParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.modal) {
    searchParams.set(DASHBOARD_POSTS_QUERY_PARAM.modal, params.modal);
  }

  if (params.editId) {
    searchParams.set(DASHBOARD_POSTS_QUERY_PARAM.edit, params.editId);
  }

  if (
    params.presentation &&
    params.presentation !== DASHBOARD_POSTS_PRESENTATION.modal
  ) {
    searchParams.set(DASHBOARD_POSTS_QUERY_PARAM.presentation, params.presentation);
  }

  const search = searchParams.toString();

  return search ? `/dashboard/posts?${search}` : "/dashboard/posts";
}

export function getPostStatusTone(status: PostStatus): DashboardStatusTone {
  switch (status) {
    case POST_STATUS.published:
      return "success";
    case POST_STATUS.draft:
      return "warning";
    case POST_STATUS.archived:
    default:
      return "neutral";
  }
}

export function formatDashboardPostTitle(title: string) {
  return title.toUpperCase().replaceAll(" ", "_");
}

export function buildDashboardPostsMetrics(
  posts: PostOverview[],
): DashboardPostsMetrics {
  return {
    draftCount: posts.filter((post) => post.status === POST_STATUS.draft).length,
    publishedCount: posts.filter((post) => post.status === POST_STATUS.published)
      .length,
    totalCount: posts.length,
  };
}

export function buildDeniedDashboardPostsLoaderData(): DashboardPostsDeniedLoaderData {
  return {
    access: "denied",
    form: buildDashboardPostsFormState({
      mode: null,
      values: buildPostFormValues(),
    }),
    metrics: buildDashboardPostsMetrics([]),
    permissions: {
      canCreate: false,
      canDelete: false,
      canUpdate: false,
    },
    posts: [],
  };
}

export function resolveDashboardPostsForm({
  editId,
  modal,
  posts,
}: ResolveDashboardPostsFormArgs): DashboardPostsFormState {
  const editingPost = posts.find((post) => post.id === editId);
  const mode =
    modal === DASHBOARD_POSTS_MODAL.create
      ? DASHBOARD_POSTS_MODAL.create
      : editingPost
        ? DASHBOARD_POSTS_MODAL.edit
        : null;

  return buildDashboardPostsFormState({
    editingPostId: editingPost?.id,
    mode,
    values: editingPost ? toPostFormValues(editingPost) : buildPostFormValues(),
  });
}

export function mergeDashboardPostsFormState(
  loaderForm: DashboardPostsFormState,
  actionData?: PostFormState,
): DashboardPostsFormState {
  if (!actionData) {
    return buildDashboardPostsFormState({
      editingPostId: loaderForm.editingPostId,
      mode: loaderForm.mode,
      presentation: loaderForm.presentation,
      slugSuggestion: loaderForm.slugSuggestion,
      values: loaderForm.values,
    });
  }

  return buildDashboardPostsFormState({
    editingPostId: loaderForm.editingPostId,
    errors: actionData.errors,
    mode: loaderForm.mode,
    presentation: loaderForm.presentation,
    slugSuggestion: actionData.slugSuggestion,
    values: actionData.values,
  });
}

export function useDashboardPostStatusOptions() {
  const t = useT();

  return buildPostStatusOptions(t);
}
