import {
  buildProjectFormValues,
  type ProjectFormState,
  type ProjectFormValues,
} from "~/domain/projects/form";
import {
  PROJECT_STATUS,
  buildProjectStatusOptions,
  type ProjectStatus,
} from "~/domain/projects/model";
import { useT } from "~/shared/i18n/i18n-react";
import type {
  DashboardProjectsMetrics as DashboardProjectsPageMetrics,
  ProjectOverview,
} from "~/lib/projects/projects.server";
import {
  buildDashboardPaginationState,
  DASHBOARD_PAGINATION_DIRECTION,
  normalizeDashboardPaginationDirection,
  type DashboardPaginationDirection,
  type DashboardPaginationState,
} from "../shared/pagination";

type ValueOf<T> = T[keyof T];

export const DASHBOARD_PROJECTS_QUERY_PARAM = {
  cursor: "cursor",
  direction: "direction",
  edit: "edit",
  modal: "modal",
  search: "search",
  status: "status",
} as const;

export const DASHBOARD_PROJECTS_MODAL = {
  create: "create",
  edit: "edit",
} as const;

export type DashboardProjectsModalMode = ValueOf<typeof DASHBOARD_PROJECTS_MODAL>;

export type DashboardStatusTone = "danger" | "neutral" | "success" | "warning";
export const DASHBOARD_PROJECTS_PAGE_SIZE = 20;
export const DASHBOARD_PROJECTS_STATUS_FILTER = {
  all: "all",
  archived: PROJECT_STATUS.archived,
  draft: PROJECT_STATUS.draft,
  published: PROJECT_STATUS.published,
} as const;

export type DashboardProjectsStatusFilter =
  (typeof DASHBOARD_PROJECTS_STATUS_FILTER)[keyof typeof DASHBOARD_PROJECTS_STATUS_FILTER];

export interface DashboardProjectsMetrics {
  featuredCount: number;
  liveCount: number;
  totalCount: number;
}

export interface DashboardProjectsPermissions {
  canCreate: boolean;
  canDelete: boolean;
  canUpdate: boolean;
}

export interface DashboardProjectsFormState {
  editingProjectId: string | null;
  errors?: ProjectFormState["errors"];
  isOpen: boolean;
  mode: DashboardProjectsModalMode | null;
  slugSuggestion?: string | null;
  values: ProjectFormValues;
}

export interface DashboardProjectsFilters {
  searchQuery: string;
  status: DashboardProjectsStatusFilter;
}

export interface DashboardProjectsGrantedLoaderData {
  access: "granted";
  filters: DashboardProjectsFilters;
  form: DashboardProjectsFormState;
  metrics: DashboardProjectsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardProjectsPermissions;
  projects: ProjectOverview[];
}

export interface DashboardProjectsDeniedLoaderData {
  access: "denied";
}

export type DashboardProjectsLoaderData =
  | DashboardProjectsDeniedLoaderData
  | DashboardProjectsGrantedLoaderData;

export interface DashboardProjectsHrefParams {
  cursor?: string | null;
  direction?: DashboardPaginationDirection | null;
  editId?: string | null;
  modal?: Extract<DashboardProjectsModalMode, "create"> | null;
  search?: string | null;
  status?: DashboardProjectsStatusFilter | null;
}

interface ResolveDashboardProjectsFormArgs {
  editId: string | null;
  modal: string | null;
  projects: ProjectOverview[];
}

interface BuildDashboardProjectsFormStateArgs {
  editingProjectId?: string | null;
  errors?: ProjectFormState["errors"];
  mode: DashboardProjectsModalMode | null;
  slugSuggestion?: string | null;
  values: ProjectFormValues;
}

export interface DashboardProjectsViewState {
  cursor: string | null;
  direction: DashboardPaginationDirection;
  searchQuery: string;
  status: DashboardProjectsStatusFilter;
}

function toProjectFormValues(project: ProjectOverview): ProjectFormValues {
  return buildProjectFormValues({
    coverImageUrl: project.coverImageUrl ?? "",
    description: project.description ?? "",
    isFeatured: project.isFeatured,
    liveUrl: project.liveUrl ?? "",
    repositoryUrl: project.repositoryUrl ?? "",
    slug: project.slug,
    sortOrder: project.sortOrder.toString(),
    status: project.status,
    summary: project.summary,
    title: project.title,
  });
}

function buildDashboardProjectsFormState({
  editingProjectId,
  errors,
  mode,
  slugSuggestion,
  values,
}: BuildDashboardProjectsFormStateArgs): DashboardProjectsFormState {
  return {
    editingProjectId: editingProjectId ?? null,
    errors,
    isOpen: mode !== null,
    mode,
    slugSuggestion: slugSuggestion ?? null,
    values,
  };
}

export function buildDashboardProjectsHref(params: DashboardProjectsHrefParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set(DASHBOARD_PROJECTS_QUERY_PARAM.search, params.search);
  }

  if (params.status && params.status !== DASHBOARD_PROJECTS_STATUS_FILTER.all) {
    searchParams.set(DASHBOARD_PROJECTS_QUERY_PARAM.status, params.status);
  }

  if (params.cursor) {
    searchParams.set(DASHBOARD_PROJECTS_QUERY_PARAM.cursor, params.cursor);
  }

  if (
    params.direction &&
    (params.direction !== DASHBOARD_PAGINATION_DIRECTION.next || params.cursor)
  ) {
    searchParams.set(DASHBOARD_PROJECTS_QUERY_PARAM.direction, params.direction);
  }

  if (params.modal) {
    searchParams.set(DASHBOARD_PROJECTS_QUERY_PARAM.modal, params.modal);
  }

  if (params.editId) {
    searchParams.set(DASHBOARD_PROJECTS_QUERY_PARAM.edit, params.editId);
  }

  const search = searchParams.toString();

  return search ? `/dashboard/projects?${search}` : "/dashboard/projects";
}

export function getProjectStatusTone(status: ProjectStatus): DashboardStatusTone {
  switch (status) {
    case PROJECT_STATUS.published:
      return "success";
    case PROJECT_STATUS.draft:
      return "warning";
    default:
      return "neutral";
  }
}

export function formatDashboardProjectTitle(title: string) {
  return title.toUpperCase().replaceAll(" ", "_");
}

export function buildDashboardProjectsMetrics(
  metrics: DashboardProjectsPageMetrics,
): DashboardProjectsMetrics {
  return {
    featuredCount: metrics.featuredCount,
    liveCount: metrics.liveCount,
    totalCount: metrics.totalCount,
  };
}

export function buildDashboardProjectsFilters(
  viewState: DashboardProjectsViewState,
): DashboardProjectsFilters {
  return {
    searchQuery: viewState.searchQuery,
    status: viewState.status,
  };
}

export function buildDashboardProjectsPaginationState(args: {
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
    pageSize: args.pageSize ?? DASHBOARD_PROJECTS_PAGE_SIZE,
    previousCursor: args.previousCursor,
  });
}

export function normalizeDashboardProjectsSearchQuery(value: string | null) {
  return value?.trim() ?? "";
}

export function normalizeDashboardProjectsStatusFilter(
  value: string | null,
): DashboardProjectsStatusFilter {
  return value === PROJECT_STATUS.archived ||
    value === PROJECT_STATUS.draft ||
    value === PROJECT_STATUS.published
    ? value
    : DASHBOARD_PROJECTS_STATUS_FILTER.all;
}

export function buildDashboardProjectsViewState(url: URL): DashboardProjectsViewState {
  return {
    cursor: url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.cursor),
    direction: normalizeDashboardPaginationDirection(
      url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.direction),
    ),
    searchQuery: normalizeDashboardProjectsSearchQuery(
      url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.search),
    ),
    status: normalizeDashboardProjectsStatusFilter(
      url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.status),
    ),
  };
}

export function resolveDashboardProjectsForm({
  editId,
  modal,
  projects,
}: ResolveDashboardProjectsFormArgs): DashboardProjectsFormState {
  const editingProject = projects.find((project) => project.id === editId);
  const mode =
    modal === DASHBOARD_PROJECTS_MODAL.create
      ? DASHBOARD_PROJECTS_MODAL.create
      : editingProject
        ? DASHBOARD_PROJECTS_MODAL.edit
        : null;

  return buildDashboardProjectsFormState({
    editingProjectId: editingProject?.id,
    mode,
    values: editingProject
      ? toProjectFormValues(editingProject)
      : buildProjectFormValues(),
  });
}

export function mergeDashboardProjectsFormState(
  loaderForm: DashboardProjectsFormState,
  actionData?: ProjectFormState,
): DashboardProjectsFormState {
  if (!actionData) {
    return buildDashboardProjectsFormState({
      editingProjectId: loaderForm.editingProjectId,
      mode: loaderForm.mode,
      slugSuggestion: loaderForm.slugSuggestion,
      values: loaderForm.values,
    });
  }

  return buildDashboardProjectsFormState({
    editingProjectId: loaderForm.editingProjectId,
    errors: actionData.errors,
    mode: loaderForm.mode,
    slugSuggestion: actionData.slugSuggestion,
    values: actionData.values,
  });
}

export function useDashboardProjectStatusOptions() {
  const t = useT();

  return buildProjectStatusOptions(t);
}

export function useDashboardProjectStatusFilterOptions() {
  const t = useT();

  return [
    {
      label: t("dashboard.projects.filter.status.all"),
      value: DASHBOARD_PROJECTS_STATUS_FILTER.all,
    },
    ...buildProjectStatusOptions(t),
  ] as const;
}
