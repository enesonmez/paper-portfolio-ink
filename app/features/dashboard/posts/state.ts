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
import type {
  DashboardPostListMetrics,
  EditablePost,
  PostOverview,
} from "~/lib/posts/posts.server";
import {
  buildDashboardPaginationState,
  DASHBOARD_PAGINATION_DIRECTION,
  normalizeDashboardPaginationDirection,
  type DashboardPaginationDirection,
  type DashboardPaginationState,
} from "../shared/pagination";

type ValueOf<T> = T[keyof T];

export const DASHBOARD_POSTS_QUERY_PARAM = {
  cursor: "cursor",
  direction: "direction",
  edit: "edit",
  presentation: "presentation",
  modal: "modal",
  search: "search",
  status: "status",
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
export const DASHBOARD_POSTS_PAGE_SIZE = 20;
export const DASHBOARD_POSTS_STATUS_FILTER = {
  all: "all",
  archived: POST_STATUS.archived,
  draft: POST_STATUS.draft,
  published: POST_STATUS.published,
} as const;

export type DashboardPostsStatusFilter =
  (typeof DASHBOARD_POSTS_STATUS_FILTER)[keyof typeof DASHBOARD_POSTS_STATUS_FILTER];

export interface DashboardPostsMetrics {
  draftCount: number;
  publishedCount: number;
  totalCount: number;
}

export interface DashboardPostsFilters {
  searchQuery: string;
  status: DashboardPostsStatusFilter;
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
  filters: DashboardPostsFilters;
  form: DashboardPostsFormState;
  metrics: DashboardPostsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardPostsPermissions;
  posts: PostOverview[];
}

export interface DashboardPostsDeniedLoaderData {
  access: "denied";
  filters: DashboardPostsFilters;
  form: DashboardPostsFormState;
  metrics: DashboardPostsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardPostsPermissions;
  posts: PostOverview[];
}

export type DashboardPostsLoaderData =
  | DashboardPostsDeniedLoaderData
  | DashboardPostsGrantedLoaderData;

export interface DashboardPostsHrefParams {
  cursor?: string | null;
  direction?: DashboardPaginationDirection | null;
  editId?: string | null;
  modal?: Extract<DashboardPostsModalMode, "create"> | null;
  presentation?: DashboardPostsPresentationMode | null;
  search?: string | null;
  status?: DashboardPostsStatusFilter | null;
}

interface ResolveDashboardPostsFormArgs {
  editablePost: EditablePost | null;
  editId: string | null;
  modal: string | null;
}

interface BuildDashboardPostsFormStateArgs {
  editingPostId?: string | null;
  errors?: PostFormState["errors"];
  mode: DashboardPostsModalMode | null;
  presentation?: DashboardPostsPresentationMode;
  slugSuggestion?: string | null;
  values: PostFormValues;
}

export interface DashboardPostsViewState {
  cursor: string | null;
  direction: DashboardPaginationDirection;
  searchQuery: string;
  status: DashboardPostsStatusFilter;
}

function toPostFormValues(post: EditablePost): PostFormValues {
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

  if (params.search) {
    searchParams.set(DASHBOARD_POSTS_QUERY_PARAM.search, params.search);
  }

  if (params.status && params.status !== DASHBOARD_POSTS_STATUS_FILTER.all) {
    searchParams.set(DASHBOARD_POSTS_QUERY_PARAM.status, params.status);
  }

  if (params.cursor) {
    searchParams.set(DASHBOARD_POSTS_QUERY_PARAM.cursor, params.cursor);
  }

  if (
    params.direction &&
    (params.direction !== DASHBOARD_PAGINATION_DIRECTION.next || params.cursor)
  ) {
    searchParams.set(DASHBOARD_POSTS_QUERY_PARAM.direction, params.direction);
  }

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
  metrics: DashboardPostListMetrics,
): DashboardPostsMetrics {
  return {
    draftCount: metrics.draftCount,
    publishedCount: metrics.publishedCount,
    totalCount: metrics.totalCount,
  };
}

export function buildDashboardPostsFilters(
  viewState: DashboardPostsViewState,
): DashboardPostsFilters {
  return {
    searchQuery: viewState.searchQuery,
    status: viewState.status,
  };
}

export function buildDashboardPostsPaginationState(args: {
  currentCursor: string | null;
  direction: DashboardPaginationDirection;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string | null;
  pageSize?: number;
  previousCursor?: string | null;
}): DashboardPaginationState {
  return buildDashboardPaginationState({
    currentCursor: args.currentCursor,
    direction: args.direction,
    hasNextPage: args.hasNextPage,
    hasPreviousPage: args.hasPreviousPage,
    nextCursor: args.nextCursor,
    pageSize: args.pageSize ?? DASHBOARD_POSTS_PAGE_SIZE,
    previousCursor: args.previousCursor,
  });
}

export function normalizeDashboardPostsSearchQuery(value: string | null) {
  return value?.trim() ?? "";
}

export function normalizeDashboardPostsStatusFilter(
  value: string | null,
): DashboardPostsStatusFilter {
  return value === POST_STATUS.archived ||
    value === POST_STATUS.draft ||
    value === POST_STATUS.published
    ? value
    : DASHBOARD_POSTS_STATUS_FILTER.all;
}

export function buildDashboardPostsViewState(url: URL): DashboardPostsViewState {
  return {
    cursor: url.searchParams.get(DASHBOARD_POSTS_QUERY_PARAM.cursor),
    direction: normalizeDashboardPaginationDirection(
      url.searchParams.get(DASHBOARD_POSTS_QUERY_PARAM.direction),
    ),
    searchQuery: normalizeDashboardPostsSearchQuery(
      url.searchParams.get(DASHBOARD_POSTS_QUERY_PARAM.search),
    ),
    status: normalizeDashboardPostsStatusFilter(
      url.searchParams.get(DASHBOARD_POSTS_QUERY_PARAM.status),
    ),
  };
}

export function buildDeniedDashboardPostsLoaderData(): DashboardPostsDeniedLoaderData {
  return {
    access: "denied",
    filters: buildDashboardPostsFilters({
      cursor: null,
      direction: DASHBOARD_PAGINATION_DIRECTION.next,
      searchQuery: "",
      status: DASHBOARD_POSTS_STATUS_FILTER.all,
    }),
    form: buildDashboardPostsFormState({
      mode: null,
      values: buildPostFormValues(),
    }),
    metrics: buildDashboardPostsMetrics({
      draftCount: 0,
      publishedCount: 0,
      totalCount: 0,
    }),
    pagination: buildDashboardPostsPaginationState({
      currentCursor: null,
      direction: DASHBOARD_PAGINATION_DIRECTION.next,
    }),
    permissions: {
      canCreate: false,
      canDelete: false,
      canUpdate: false,
    },
    posts: [],
  };
}

export function resolveDashboardPostsForm({
  editablePost,
  editId,
  modal,
}: ResolveDashboardPostsFormArgs): DashboardPostsFormState {
  const mode =
    modal === DASHBOARD_POSTS_MODAL.create
      ? DASHBOARD_POSTS_MODAL.create
      : editablePost && editablePost.id === editId
        ? DASHBOARD_POSTS_MODAL.edit
        : null;

  return buildDashboardPostsFormState({
    editingPostId: editablePost?.id,
    mode,
    values: editablePost ? toPostFormValues(editablePost) : buildPostFormValues(),
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

export function useDashboardPostStatusFilterOptions() {
  const t = useT();

  return [
    {
      label: t("dashboard.posts.filter.status.all"),
      value: DASHBOARD_POSTS_STATUS_FILTER.all,
    },
    ...buildPostStatusOptions(t),
  ] as const;
}
