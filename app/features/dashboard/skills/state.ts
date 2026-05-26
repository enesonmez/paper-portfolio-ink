import {
  buildSkillFormValues,
  type SkillFormState,
  type SkillFormValues,
} from "~/domain/skills/form";
import type { SkillOverview } from "~/lib/skills/skills.server";
import {
  buildDashboardPaginationState,
  DASHBOARD_PAGINATION_DIRECTION,
  normalizeDashboardPaginationDirection,
  type DashboardPaginationDirection,
  type DashboardPaginationState,
} from "../shared/pagination";

type ValueOf<T> = T[keyof T];

export const DASHBOARD_SKILLS_QUERY_PARAM = {
  cursor: "cursor",
  direction: "direction",
  edit: "edit",
  modal: "modal",
  search: "search",
} as const;

export const DASHBOARD_SKILLS_MODAL = {
  create: "create",
  edit: "edit",
} as const;

export type DashboardSkillsModalMode = ValueOf<typeof DASHBOARD_SKILLS_MODAL>;
export const DASHBOARD_SKILLS_PAGE_SIZE = 20;

export interface DashboardSkillsMetrics {
  totalCount: number;
}

export interface DashboardSkillsPermissions {
  canCreate: boolean;
  canDelete: boolean;
  canUpdate: boolean;
}

export interface DashboardSkillsFormState {
  editingSkillId: string | null;
  errors?: SkillFormState["errors"];
  isOpen: boolean;
  mode: DashboardSkillsModalMode | null;
  values: SkillFormValues;
}

export interface DashboardSkillsFilters {
  searchQuery: string;
}

export interface DashboardSkillsGrantedLoaderData {
  access: "granted";
  filters: DashboardSkillsFilters;
  form: DashboardSkillsFormState;
  metrics: DashboardSkillsMetrics;
  pagination: DashboardPaginationState;
  permissions: DashboardSkillsPermissions;
  skills: SkillOverview[];
}

export interface DashboardSkillsDeniedLoaderData {
  access: "denied";
}

export type DashboardSkillsLoaderData =
  | DashboardSkillsDeniedLoaderData
  | DashboardSkillsGrantedLoaderData;

interface ResolveDashboardSkillsFormArgs {
  editId: string | null;
  modal: string | null;
  skills: SkillOverview[];
}

interface BuildDashboardSkillsFormStateArgs {
  editingSkillId?: string | null;
  errors?: SkillFormState["errors"];
  mode: DashboardSkillsModalMode | null;
  values: SkillFormValues;
}

export interface DashboardSkillsHrefParams {
  cursor?: string | null;
  direction?: DashboardPaginationDirection | null;
  editId?: string | null;
  modal?: Extract<DashboardSkillsModalMode, "create"> | null;
  search?: string | null;
}

export interface DashboardSkillsViewState {
  cursor: string | null;
  direction: DashboardPaginationDirection;
  searchQuery: string;
}

function toSkillFormValues(skill: SkillOverview): SkillFormValues {
  return buildSkillFormValues({
    iconKey: skill.iconKey,
    name: skill.name,
    sortOrder: skill.sortOrder.toString(),
    summary: skill.summary,
  });
}

function buildDashboardSkillsFormState({
  editingSkillId,
  errors,
  mode,
  values,
}: BuildDashboardSkillsFormStateArgs): DashboardSkillsFormState {
  return {
    editingSkillId: editingSkillId ?? null,
    errors,
    isOpen: mode !== null,
    mode,
    values,
  };
}

export function buildDashboardSkillsHref(params: DashboardSkillsHrefParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set(DASHBOARD_SKILLS_QUERY_PARAM.search, params.search);
  }

  if (params.cursor) {
    searchParams.set(DASHBOARD_SKILLS_QUERY_PARAM.cursor, params.cursor);
  }

  if (
    params.direction &&
    (params.direction !== DASHBOARD_PAGINATION_DIRECTION.next || params.cursor)
  ) {
    searchParams.set(DASHBOARD_SKILLS_QUERY_PARAM.direction, params.direction);
  }

  if (params.modal) {
    searchParams.set(DASHBOARD_SKILLS_QUERY_PARAM.modal, params.modal);
  }

  if (params.editId) {
    searchParams.set(DASHBOARD_SKILLS_QUERY_PARAM.edit, params.editId);
  }

  const search = searchParams.toString();

  return search ? `/dashboard/skills?${search}` : "/dashboard/skills";
}

export function buildDashboardSkillsMetrics(
  totalCount: number,
): DashboardSkillsMetrics {
  return {
    totalCount,
  };
}

export function buildDashboardSkillsFilters(
  viewState: DashboardSkillsViewState,
): DashboardSkillsFilters {
  return {
    searchQuery: viewState.searchQuery,
  };
}

export function buildDashboardSkillsPaginationState(args: {
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
    pageSize: args.pageSize ?? DASHBOARD_SKILLS_PAGE_SIZE,
    previousCursor: args.previousCursor,
  });
}

export function normalizeDashboardSkillsSearchQuery(value: string | null) {
  return value?.trim() ?? "";
}

export function buildDashboardSkillsViewState(url: URL): DashboardSkillsViewState {
  return {
    cursor: url.searchParams.get(DASHBOARD_SKILLS_QUERY_PARAM.cursor),
    direction: normalizeDashboardPaginationDirection(
      url.searchParams.get(DASHBOARD_SKILLS_QUERY_PARAM.direction),
    ),
    searchQuery: normalizeDashboardSkillsSearchQuery(
      url.searchParams.get(DASHBOARD_SKILLS_QUERY_PARAM.search),
    ),
  };
}

export function formatDashboardSkillName(name: string) {
  return name.toUpperCase().replaceAll(" ", "_");
}

export function resolveDashboardSkillsForm({
  editId,
  modal,
  skills,
}: ResolveDashboardSkillsFormArgs): DashboardSkillsFormState {
  const editingSkill = skills.find((skill) => skill.id === editId);
  const mode =
    modal === DASHBOARD_SKILLS_MODAL.create
      ? DASHBOARD_SKILLS_MODAL.create
      : editingSkill
        ? DASHBOARD_SKILLS_MODAL.edit
        : null;

  return buildDashboardSkillsFormState({
    editingSkillId: editingSkill?.id,
    mode,
    values: editingSkill ? toSkillFormValues(editingSkill) : buildSkillFormValues(),
  });
}

export function mergeDashboardSkillsFormState(
  loaderForm: DashboardSkillsFormState,
  actionData?: SkillFormState,
): DashboardSkillsFormState {
  if (!actionData) {
    return buildDashboardSkillsFormState({
      editingSkillId: loaderForm.editingSkillId,
      mode: loaderForm.mode,
      values: loaderForm.values,
    });
  }

  return buildDashboardSkillsFormState({
    editingSkillId: loaderForm.editingSkillId,
    errors: actionData.errors,
    mode: loaderForm.mode,
    values: actionData.values,
  });
}
