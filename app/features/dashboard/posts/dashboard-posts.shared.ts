import {
  buildPostFormValues,
  type PostFormState,
  type PostFormValues,
} from "~/features/posts/post-form.shared";
import {
  DASHBOARD_POSTS_MODAL,
  DASHBOARD_POSTS_PRESENTATION,
  DASHBOARD_POSTS_QUERY_PARAM,
  POST_STATUS,
  buildPostStatusOptions,
  type DashboardPostsModalMode,
  type DashboardPostsPresentationMode,
  type PostStatus,
} from "~/features/posts/post.shared";
import { useT } from "~/features/i18n/i18n-react";
import type { PostOverview } from "~/lib/posts/posts.server";

export type DashboardStatusTone = "danger" | "neutral" | "success" | "warning";

export interface DashboardPostsMetrics {
  draftCount: number;
  publishedCount: number;
  totalCount: number;
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

export interface DashboardPostsLoaderData {
  form: DashboardPostsFormState;
  metrics: DashboardPostsMetrics;
  posts: PostOverview[];
}

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

  return {
    editingPostId: editingPost?.id ?? null,
    isOpen: mode !== null,
    mode,
    presentation:
      mode !== null
        ? DASHBOARD_POSTS_PRESENTATION.fullscreen
        : DASHBOARD_POSTS_PRESENTATION.modal,
    slugSuggestion: null,
    values: editingPost ? toPostFormValues(editingPost) : buildPostFormValues(),
  };
}

export function mergeDashboardPostsFormState(
  loaderForm: DashboardPostsFormState,
  actionData?: PostFormState,
): DashboardPostsFormState {
  if (!actionData) {
    return {
      ...loaderForm,
      errors: undefined,
    };
  }

  return {
    editingPostId: loaderForm.editingPostId,
    errors: actionData.errors,
    isOpen: loaderForm.isOpen,
    mode: loaderForm.mode,
    presentation: loaderForm.presentation,
    slugSuggestion: actionData.slugSuggestion ?? null,
    values: actionData.values,
  };
}

export function useDashboardPostStatusOptions() {
  const t = useT();

  return buildPostStatusOptions(t);
}
